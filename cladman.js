const { time } = require('console');
const csv = require('csv-parse/lib/sync');
const fs = require('fs');
var iconvlite = require('iconv-lite');
const fetch = require('node-fetch');

class Cladman{
    constructor(){
        let data = iconvlite.decode(fs.readFileSync('schedule.csv'), 'cp1251');
        let table = csv(data, {delimiter: ';', columns: ['name', 'model', 'id', 'date', 'load_time', 'unload_time', 'manufacturer'], from: 2 });
        let itemById = {};
        this.itemById = itemById;
        this.sides = ["right", "left"];
        
        
        


        for(let item of table){
            let time_load = Cladman.decodeTime(item.load_time);
            let time_unload = Cladman.decodeTime(item.unload_time);
            // console.log(time_load);
            setTimeout(()=>{
                fetch(`http://127.0.0.1:8228/load/${item.id}/${this.sides[Math.floor(this.nextCell/2)%2]}:${this.sides[this.nextCell % 2]}:${Math.floor(this.nextCell/4)+1}`);
                this.nextCell++;
            }, time_load - 25000);

            setTimeout(()=>{
                if(item.state != "out"){
                    fetch(`http://127.0.0.1:8228/unload/${item.id}`);
                }
            }, time_unload - 25000);

            item.state = 'pending'
            itemById[item.id] = item;
        }
        this.nextCell = 0;
        this.items = table;

        setInterval(async ()=>{
            let request = await fetch('http://127.0.0.1:8228/data');
            let data = await request.json();

            

            for(let sharpItem of data){
                if(sharpItem.Dest === 'Out')itemById[sharpItem.Id].state = "out";
                else if(sharpItem.Moving === false)itemById[sharpItem.Id].state = "store";
                else itemById[sharpItem.Id].state = "moving";
                itemById[sharpItem.Id].location = sharpItem.Place;
            }
        }, 500);

    }
    static decodeTime(str){
        let arr = str.split(':')
        let time = (parseInt(arr[0]) - 10)*60*60*1000 + parseInt(arr[1])*60*1000 + parseInt(arr[2])*1000;
        return time;
    }

    unload(id) {
        if(!this.itemById.hasOwnProperty(id)){
            return "No such item";
        }
        fetch(`http://127.0.0.1:8228/unload/${id}`);
        return null;
    }



    move(id, rack, side, cell){
        rack = (rack || 'error').toLowerCase();
        side = (side || 'error').toLowerCase();
        if(!this.itemById.hasOwnProperty(id)){
            return "No such item";
        }
        if(this.itemById[id].state != "store"){
            return "Item cannot be moved now";
        }
        if(!this.sides.includes(rack) || !this.sides.includes(side)){
            return "Invalid side";
        }
        cell = parseInt(cell);
        if(isNaN(cell) || !(1<=cell<=54)){
            return "Invalid cell number";
        }
        let location = `${rack}:${side}:${cell}`;

        for(let item of this.items){
            if(!item.location)continue;
            let itemLoc = `${item.location.Rack}:${item.location.CellSide}:${item.location.CellPosition}`.toLowerCase();
            // console.log(itemLoc, location, item.state);
            if(location === itemLoc)return `Cell ${location} already occupied`;
        }

        fetch(`http://127.0.0.1:8228/move/${id}/${location}`);

        return null;

    }

    
}

module.exports = new Cladman();