// ============================================
// Gopes Pinnacle Academy
// Universal Timezone Utility
// School Timezone : Asia/Kolkata
// ============================================

const SCHOOL_TIMEZONE = "Asia/Kolkata";

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

function getNextOccurrence(dayName){

    const today = new Date();

    const target = DAYS.indexOf(dayName);

    let diff = target - today.getDay();

    if(diff < 0)
        diff += 7;

    const d = new Date(today);

    d.setDate(today.getDate() + diff);

    return d;

}

function buildDate(day,time){

    const d = getNextOccurrence(day);

    const [h,m] = time.split(":").map(Number);

    d.setHours(h,m,0,0);

    return d;

}

function splitDate(date,timeZone){

    const parts = new Intl.DateTimeFormat(
        "en-US",
        {
            weekday:"long",
            hour:"numeric",
            minute:"2-digit",
            hour12:true,
            timeZone
        }
    ).formatToParts(date);

    const obj={};

    parts.forEach(p=>{

        obj[p.type]=p.value;

    });

    return{

        day:obj.weekday,

        time:
        obj.hour +
        ":" +
        obj.minute +
        " " +
        obj.dayPeriod

    };

}

function convertISTToLocal(day,startTime,endTime){

    const start = buildDate(day,startTime);

    const end = buildDate(day,endTime);

    const userZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

    const istStart =
    splitDate(start,SCHOOL_TIMEZONE);

    const istEnd =
    splitDate(end,SCHOOL_TIMEZONE);

    const localStart =
    splitDate(start,userZone);

    const localEnd =
    splitDate(end,userZone);

    return{

        timezone:userZone,

        ist:{

            day:istStart.day,

            start:istStart.time,

            end:istEnd.time

        },

        local:{

            day:localStart.day,

            start:localStart.time,

            end:localEnd.time

        }

    };

}

function getPeriodStatus(day,startTime,endTime){

    const now = new Date();

    const start = buildDate(day,startTime);

    const end = buildDate(day,endTime);

    if(now < start)
        return "upcoming";

    if(now>=start && now<=end)
        return "live";

    return "completed";

}