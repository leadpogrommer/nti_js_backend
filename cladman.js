const { time } = require('console');
const csv = require('csv-parse/lib/sync');
const fs = require('fs');
var iconvlite = require('iconv-lite');
const fetch = require('node-fetch');

class Cladman{
    constructor(){
        let data = iconvlite.decode(fs.readFileSync('schedule.csv'), 'cp1251');
        let table = csv(data, {delimiter: ';', columns: ['name', 'model', 'id', 'date', 'load_time', 'unload_time', 'manufacturer'], from: 2 });
        for(let item of table){
            let time_load = Cladman.decodeTime(item.load_time);
            // console.log(time_load);
            setTimeout(()=>{
                fetch(`http://172.31.224.1:8228/load/${item.id}/left:left:${this.nextCell++}`);
            }, time_load - 25000);
        }
        this.nextCell = 1;
        // console.log(table);
    }
    static decodeTime(str){
        let arr = str.split(':')
        let time = (parseInt(arr[0]) - 10)*60*60*1000 + parseInt(arr[1])*60*1000 + parseInt(arr[2])*1000;
        return time;
    }

    
}

module.exports = Cladman;