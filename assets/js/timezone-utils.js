// ===========================================
// Gopes Pinnacle Academy Timezone Utilities
// School Timezone : Asia/Kolkata (IST)
// ===========================================

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

    const targetDay = DAYS.indexOf(dayName);

    let diff = targetDay - today.getDay();

    if(diff < 0)
        diff += 7;

    const date = new Date(today);

    date.setDate(today.getDate() + diff);

    return date;

}

function buildDate(day,time){

    const d = getNextOccurrence(day);

    const [h,m] = time.split(":").map(Number);

    d.setHours(h,m,0,0);

    return d;

}

function formatDate(date,timeZone){

    return new Intl.DateTimeFormat("en-US",{

        weekday:"long",

        hour:"2-digit",

        minute:"2-digit",

        hour12:true,

        timeZone

    }).format(date);

}

function convertISTToLocal(day,startTime,endTime){

    const start = buildDate(day,startTime);

    const end = buildDate(day,endTime);

    const localZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

    return{

        timezone:localZone,

        istStart:formatDate(start,SCHOOL_TIMEZONE),

        istEnd:formatDate(end,SCHOOL_TIMEZONE),

        localStart:formatDate(start,localZone),

        localEnd:formatDate(end,localZone)

    };

}

/* ===========================
   STATUS
=========================== */

function getPeriodStatus(day,startTime,endTime){

    const now = new Date();

    const start = buildDate(day,startTime);

    const end = buildDate(day,endTime);

    if(now < start)
        return "upcoming";

    if(now >= start && now <= end)
        return "live";

    return "completed";

}