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

function buildDate(day, time) {

    const targetDate = getNextOccurrence(day);

    const [hour, minute] = time.split(":").map(Number);

    // Build the date components as an IST date/time
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const date = targetDate.getDate();

    // IST = UTC + 5:30
    // Create the equivalent UTC instant
    const utcMillis = Date.UTC(
        year,
        month,
        date,
        hour - 5,
        minute - 30,
        0,
        0
    );

    return new Date(utcMillis);

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

        startDay:istStart.day,
        endDay:istEnd.day,

        start:istStart.time,
        end:istEnd.time

    },

    local:{

        startDay:localStart.day,
        endDay:localEnd.day,

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

function getPeriodInfo(day,startTime,endTime){

    const timing = convertISTToLocal(day,startTime,endTime);

    const now = new Date();

    const start = buildDate(day,startTime);

    const end = buildDate(day,endTime);

    let status = "upcoming";
    let joinAllowed = false;
    let countdown = "";

    if(now >= start && now <= end){

        status = "live";
        joinAllowed = true;

    }
    else if(now > end){

        status = "completed";

    }

    if(status === "upcoming"){

        const diff = start.getTime() - now.getTime();

        const totalMinutes = Math.floor(diff / 60000);

        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;

        if(days > 0){

            countdown = `Starts in ${days} day${days > 1 ? "s" : ""}`;

        }
        else if(hours > 0){

            countdown = `Starts in ${hours} hr ${minutes} min`;

        }
        else{

            countdown = `Starts in ${minutes} min`;

        }

    }

    return{

        status,

        joinAllowed,

        countdown,

        timezone: timing.timezone,

        ist: timing.ist,

        local: timing.local

    };

}