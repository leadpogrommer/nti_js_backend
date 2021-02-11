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
        let sides = ["right", "left"];
        
        


        for(let item of table){
            let time_load = Cladman.decodeTime(item.load_time);
            let time_unload = Cladman.decodeTime(item.unload_time);
            // console.log(time_load);
            setTimeout(()=>{
                fetch(`http://127.0.0.1:8228/load/${item.id}/${sides[Math.floor(this.nextCell/2)%2]}:${sides[this.nextCell % 2]}:${Math.floor(this.nextCell/4)+1}`);
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
        fetch(`http://127.0.0.1:8228/unload/${id}`);
    }

    move(id, rack, side, cell){

    }

    
}

module.exports = new Cladman();