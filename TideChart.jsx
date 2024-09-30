//
// Please consult the README.md for more information.
//
// TideChart.jsx a script for Adobe InDesign which demonstrates how to use JSXGetURL with 
// the NOAA API to retrieve tide information.
//
// (c) 2024 Kris Coppieters - Rorohiko Ltd.
//
// This script is provided "as is" without warranty of any kind.

// See: https://rorohiko.com/jsxgeturl

//@include "libs/JSXGetURLLoader.jsx"

// See: https://github.com/zwettemaan/CRDT_ES

//@include "libs/crdtesDLLLoader.jsx"
//@include "libs/crdtes.jsx"

// See: https://github.com/douglascrockford/JSON-js

//@include "json2.js"

var getURL = JSXGetURL();

var CST = {};

// https://tidesandcurrents.noaa.gov/stationhome.html?id=8722956
// South Port Everglades, FL

CST.DEFAULT_NOAA_STATION_CODE = "8722956";

CST.FEET_PER_METER = 3.28084;

CST.BASE_URL_API = "https://api.tidesandcurrents.noaa.gov/";

CST.METADATA_URL_API = CST.BASE_URL_API + "mdapi/prod/webapi/";

CST.STATION_INFO_URL_API = CST.METADATA_URL_API + "stations/";

CST.URL_EXTENSION_JSON = ".json";

CST.API_OK_RESPONSE = "OK";

CST.URL_ESCAPED_SPACE = "%20";

// See https://api.tidesandcurrents.noaa.gov/api/prod/

CST.DATA_URL_API = CST.BASE_URL_API + "api/prod/datagetter";

CST.DATA_URL_PARAM_BEGIN_DATE = "begin_date";

CST.DATA_URL_PARAM_END_DATE = "end_date";

CST.DATA_URL_PARAM_STATION = "station";

CST.DATA_URL_PARAM_PRODUCT = "product";
CST.DATA_URL_VALUE_PRODUCT_PREDICTIONS = "predictions";

CST.DATA_URL_PARAM_DATUM = "datum";
CST.DATA_URL_VALUE_DATUM_MEAN_LOWER_LOW_WATER = "MLLW";

CST.DATA_URL_PARAM_INTERVAL = "interval";
// MLLW= Mean Lower Low Water (Nautical Chart Datum for all U.S. coastal waters)
CST.DATA_URL_VALUE_INTERVAL_HOURLY = "h";

CST.DATA_URL_PARAM_UNITS = "units";
// MLLW= Mean Lower Low Water (Nautical Chart Datum for all U.S. coastal waters)
CST.DATA_URL_VALUE_UNITS_METRIC = "metric";

CST.DATA_URL_PARAM_TIME_ZONE = "time_zone";
CST.DATA_URL_VALUE_TIME_ZONE_GMT = "gmt";

CST.DATA_URL_PARAM_FORMAT = "format";
CST.DATA_URL_VALUE_FORMAT_JSON = "json";

CST.FRAME_NAME_PREFIX_BAR    = "TideChart-";
CST.FRAME_NAME_CAPTION       = "TideChartCaption";
CST.FRAME_NAME_DATE_RANGE    = "TideChartDateRange";
CST.FRAME_NAME_AREA_TEMPLATE = "TideChartParentRectangle";
CST.CAPTION_PREFIX           = "Tide Chart for ";

main();

function collectionToArray(theCollection)
{    
    var retVal = null;

    crdtes.logEntry(arguments);

    do
    {
        try 
        {
            if (theCollection instanceof Array)
            {
                retVal = theCollection.slice(0);
            }
            else
            {
                retVal = theCollection.everyItem().getElements().slice(0);
            }
        }
        catch (err)
        {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);
     
    crdtes.logExit(arguments);
    
    return retVal;
}
 
function dateToGMTParamStr(date) {

    var retVal = undefined;
    
    crdtes.logEntry(arguments);

    do {

        try {

            if (! date || ! (date instanceof Date)) {
                crdtes.logError(arguments, "need date");
                break;
            }

            var y = date.getUTCFullYear();
            var m = date.getUTCMonth() + 1;
            var d = date.getUTCDate();

            var h = date.getUTCHours();
            var min = date.getUTCMinutes();


            retVal = 
                leftPad(y, 4, "0") + 
                leftPad(m, 2, "0") + 
                leftPad(d, 2, "0") + 
                CST.URL_ESCAPED_SPACE + 
                leftPad(h, 2, "0") + 
                ":" + 
                leftPad(min, 2, "0");
        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtes.logExit(arguments);   
    
    return retVal;
}

function fetchStationInfo(context) {

    var retVal = undefined;
    
    crdtes.logEntry(arguments);

    do {

        try {

            if (! context) {
                crdtes.logError(arguments, "need context");
                break;
            }

            if (! context.noaaStationCode) {
                crdtes.logError(arguments, "need context.noaaStationCode");
                break;
            }

            var url = CST.STATION_INFO_URL_API + context.noaaStationCode + CST.URL_EXTENSION_JSON;

            getURL.clearCurlOpt();
            getURL.setCurlOpt("FOLLOWLOCATION", 1);    
            getURL.addRequestHeader("Accept: */*");

            var responseJSON = getURL.get(url) + "";

            if (! responseJSON) {
                crdtes.logError(arguments, "no response from API");
                break;
            }

            try {
                var response = JSON.parse(responseJSON);
            }
            catch (err) {
                crdtes.logError(arguments, "invalid JSON response, throws " + err);    
                break;
            }
            
            if (! response.stations || response.stations.length == 0) {
                crdtes.logError(arguments, "no stations listed in response");
                break;
            }

            context.stationInfo = response.stations[0];
            retVal = true;
        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtes.logExit(arguments);    

    return retVal;
}

function fetchTideData(context) {

    var retVal = undefined;
    
    crdtes.logEntry(arguments);
    
    do {
        
        try {

            if (! context) {
                crdtes.logError(arguments, "need context");
                break;
            }

            if (! context.noaaStationCode) {
                crdtes.logError(arguments, "need context.noaaStationCode");
                break;
            }

            var beginTime = new Date();
            beginTime.setHours(beginTime.getHours() + 1, 0, 0, 0);

            var endTime = new Date(beginTime);
            endTime.setHours(beginTime.getHours() + 23, 0, 0, 0);
            
            var url = 
                CST.DATA_URL_API + "?" + 
                CST.DATA_URL_PARAM_BEGIN_DATE + "=" + dateToGMTParamStr(beginTime) + "&" +
                CST.DATA_URL_PARAM_END_DATE   + "=" + dateToGMTParamStr(endTime) + "&" +
                CST.DATA_URL_PARAM_STATION    + "=" + context.noaaStationCode + "&" +
                CST.DATA_URL_PARAM_PRODUCT    + "=" + CST.DATA_URL_VALUE_PRODUCT_PREDICTIONS + "&" +
                CST.DATA_URL_PARAM_DATUM      + "=" + CST.DATA_URL_VALUE_DATUM_MEAN_LOWER_LOW_WATER + "&" +
                CST.DATA_URL_PARAM_INTERVAL   + "=" + CST.DATA_URL_VALUE_INTERVAL_HOURLY + "&" +
                CST.DATA_URL_PARAM_UNITS      + "=" + CST.DATA_URL_VALUE_UNITS_METRIC + "&" +
                CST.DATA_URL_PARAM_TIME_ZONE  + "=" + CST.DATA_URL_VALUE_TIME_ZONE_GMT + "&" +
                CST.DATA_URL_PARAM_FORMAT     + "=" + CST.DATA_URL_VALUE_FORMAT_JSON;
            
            getURL.clearCurlOpt();
            getURL.setCurlOpt("FOLLOWLOCATION", 1);    
            getURL.addRequestHeader("Accept: */*");

            var responseJSON = getURL.get(url) + "";

            if (! responseJSON) {
                crdtes.logError(arguments, "no response from API");
                break;
            }

            try {
                var response = JSON.parse(responseJSON);
            }
            catch (err) {
                crdtes.logError(arguments, "invalid JSON response, throws " + err);    
                break;
            }
            
            if (! response.predictions || response.predictions.length == 0) {
                crdtes.logError(arguments, "no predictions listed in response");
                break;
            }

            context.tideData = [];

            retVal = true;

            for (var idx = 0; idx < response.predictions.length; idx++) {

                try {

                    var prediction = response.predictions[idx];

                    var predictionTime = prediction.t;
                    var y   = parseInt(predictionTime.substring( 0, 4), 10);
                    var m   = parseInt(predictionTime.substring( 5, 7), 10) - 1;
                    var d   = parseInt(predictionTime.substring( 8,10), 10);
                    var hr  = parseInt(predictionTime.substring(11,13), 10);
                    var min = parseInt(predictionTime.substring(14,16), 10);

                    var predictionDate = new Date(Date.UTC(y, m, d, hr, min));
                    if (predictionDate.toString() == "Invalid Date") {
                        crdtes.logError(arguments, "response contains invalid date");
                        retVal = false;
                        break
                    }

                    var predictionLevelMeter = parseFloat(prediction.v);
                    if (isNaN(predictionLevelMeter)) {
                        predictionLevelMeter = undefined;
                    }

                    context.tideData.push({
                        predictionDate: predictionDate,
                        predictionLevelMeter: predictionLevelMeter
                    });
                }
                catch (err) {
                    crdtes.logError(arguments, "error parsing returned response " + err);
                    retVal = false;
                    break;
                }
            }
        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtes.logExit(arguments);    

    return retVal;    
}

function leftPad(str, len, pad) {
    
    var retVal = undefined;
        
    crdtes.logEntry(arguments);
    
    do {

        try {

            str = str + "";

            if (! len) {
                crdtes.logError(arguments, "need len");
                break;
            }

            if (! pad) {
                pad = " ";
            }

            while (str.length < len) {
                str = pad + str;
            }

            retVal = str.substring(str.length - len);
        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);

    crdtes.logExit(arguments);   

    return retVal;
}

function loadOptionalLicense() {

    var retVal = false;    

    crdtes.logEntry(arguments);

    do
    {
        try 
        {
            if (getURL.isJSXGetURLActivated()) {
                retVal = true;
                break;
            }

            var licenseFile = File($.scriptName).parent + "/JSXGetURLLicense.jsx";
            if (! licenseFile.exists) {
                break;
            }

            $.evalFile(licenseFile);
        }
        catch (err)
        {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);
     
    crdtes.logExit(arguments);
    
    return retVal;        
}

function main() {
    
    var context;
    
    crdtes.logEntry(arguments);

    do {

        try {
            
            context = {};
            context.errorMessages = "";

            if (! getURL.isJSXGetURLActivated()) {
                reportErrorToUser(context, "No valid JSXGetURL license found - you will need to restart InDesign after each script run");
            }

            loadOptionalLicense();

            if (! setupDocument(context)) {
                break;
            }

            app.scriptPreferences.enableRedraw = false;

            if (! fetchStationInfo(context)) {
                reportErrorToUser(context, "The script needs a valid NOAA Station Code");
                break;
            }

            if (! context.stationInfo) {
                reportErrorToUser(context, "No station info available");
                break;
            }

            if (! context.stationInfo.tidal) {
                reportErrorToUser(context, "Selected station is not tidal");
                break;
            }

            if (! fetchTideData(context)) {
                reportErrorToUser(context, "The script failed to retrieve the tide data");
                break;
            }
                 
            if (! generateTideChart(context)) {
                reportErrorToUser(context, "The script failed to generate the tide chart");
                break;
            }

        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
            reportErrorToUser(context, "Something went wrong: " + err);
        }
    }
    while (false);
        
    if (context.errorMessages) {        
        alert("Messages:\n" + context.errorMessages);
    }

    crdtes.logExit(arguments);
}

function generateTideChart(context) {

    var retVal = false;

    crdtes.logEntry(arguments);

    do {

        try {

            if (! context) {
                crdtes.logError(arguments, "needs context");
                break;
            }
            
            var doc = context.doc;
            if (! (doc instanceof Document)) {
                crdtes.logError(arguments, "needs document");
                break;
            }
                   
            var stationName = context.stationInfo.name;
            var beginDate = context.tideData[0].predictionDate.toString();            
            var endDate = context.tideData[context.tideData.length - 1].predictionDate.toString();            

            var tideChartCaptionFrame = doc.textFrames.itemByName(CST.FRAME_NAME_CAPTION);
            tideChartCaptionFrame.contents = CST.CAPTION_PREFIX + stationName;

            // Scan the tide data and determine min and max values

            var minTideHeight = undefined;
            var maxTideHeight = undefined;
            for (var idx = 0; idx < context.tideData.length; idx++) {
                var tideData = context.tideData[idx];
                var predictionLevelMeter = tideData.predictionLevelMeter;
                if (predictionLevelMeter !== undefined) {
                    if (minTideHeight === undefined || predictionLevelMeter < minTideHeight) {
                        minTideHeight = predictionLevelMeter;
                    }
                    if (maxTideHeight === undefined || predictionLevelMeter > maxTideHeight) {
                        maxTideHeight = predictionLevelMeter;
                    }
                }
            }

            if (minTideHeight === undefined || maxTideHeight === undefined) {
                reportErrorToUser(context, "Insufficient data received from the API");
                break;
            }

            var maxTideDifference = maxTideHeight - minTideHeight;

            if (! maxTideDifference) {
                reportErrorToUser(context, "Insufficient data received from the API");
                break;
            }

            var minTideHeightFeet = minTideHeight * CST.FEET_PER_METER;
            var maxTideHeightFeet = maxTideHeight * CST.FEET_PER_METER;

            var tideChartDateRangeFrame = doc.textFrames.itemByName(CST.FRAME_NAME_DATE_RANGE);
            tideChartDateRangeFrame.contents = 
                "From:\t"       + beginDate + "\r" + 
                "To:\t"         + endDate + "\r" + 
                "Min:\t"        + minTideHeightFeet.toFixed(2) + " ft (" + minTideHeight.toFixed(2) + " m)\r" +
                "Max:\t"        + maxTideHeightFeet.toFixed(2) + " ft (" + maxTideHeight.toFixed(2) + " m)\r" +
                "Difference:\t" + (maxTideHeightFeet - minTideHeightFeet).toFixed(2) + " ft (" + (maxTideHeightFeet - minTideHeight).toFixed(2) + " m)";

            // Use the area template to determine in what rectangular area to generate
            // The area template itself is not changed - it merely indicates a rectangular area

            var tideChartRectangle = doc.rectangles.itemByName(CST.FRAME_NAME_AREA_TEMPLATE);

            var xParentRectangleUpperLeft = tideChartRectangle.geometricBounds[1];
            var yParentRectangleUpperLeft = tideChartRectangle.geometricBounds[0];
            var xParentRectangleLowerRight = tideChartRectangle.geometricBounds[3];
            var yParentRectangleLowerRight = tideChartRectangle.geometricBounds[2];

            var heightParentRectangle = yParentRectangleLowerRight - yParentRectangleUpperLeft;
            var widthParentRectangle = xParentRectangleLowerRight - xParentRectangleUpperLeft;

            // Divide the width of the area by the number of tide predictions to determine
            // the width of a single bar

            var widthGraphBarRectangle = widthParentRectangle / context.tideData.length;
            
            // Allow a bit of space at the top and bottom: the bar top edges stay at least
            // widthGraphBarRectangle away from the top of the parent rectangle and 
            // is at least 2*widthGraphBarRectangle high.

            var minHeightGraphBar = 2 * widthGraphBarRectangle;
            var topPaddingGraphBar = widthGraphBarRectangle;

            var availableHeightGraphBar = heightParentRectangle - minHeightGraphBar - topPaddingGraphBar;

            // Delete any old graph bars, except one which will serve as a template

            var textFrames = collectionToArray(doc.textFrames);
            var keepBar = undefined;
            for (var idx = 0; idx < textFrames.length; idx++) { 
                var textFrame = textFrames[idx];
                if (startsWith(textFrame.name, CST.FRAME_NAME_PREFIX_BAR)) {
                    if (! keepBar) {
                        keepBar = textFrame;
                    }
                    else {
                        textFrame.remove();
                    }
                }
            }

            // Convert the tide data into a sequence of bars

            for (var idx = 0; idx < context.tideData.length; idx++) {

                var tideChartFrame;

                // For the first bar, we re-use the template, if there is one

                if (keepBar) {
                    if (idx == 0) {
                        tideChartFrame = keepBar;
                    }
                    else {
                        tideChartFrame = keepBar.duplicate();
                    }
                }
                else {
                    tideChartFrame = doc.textFrames.add();
                }

                tideChartFrame.name = CST.FRAME_NAME_PREFIX_BAR + idx;
        
                var tideData = context.tideData[idx];

                var predictionDate = tideData.predictionDate;

                var tideHeight = tideData.predictionLevelMeter;
                var tideHeightFeet = tideHeight * CST.FEET_PER_METER;

                tideChartFrame.contents = 
                    leftPad(predictionDate.getHours(), 2, "0") + ":" + leftPad(predictionDate.getMinutes(), 2, "0") + "\r" +
                    tideHeightFeet.toFixed(1) + "ft\r" + tideHeight.toFixed(1) + "m\r";

                var yBarLowerLeft = yParentRectangleLowerRight;
                var yBarUpperLeft = 
                    yBarLowerLeft 
                - 
                    minHeightGraphBar
                -
                        (availableHeightGraphBar / maxTideDifference)
                    *
                        (tideHeight - minTideHeight);

                var xBarUpperLeft = xParentRectangleUpperLeft + idx * widthGraphBarRectangle;
                var xBarLowerLeft = xBarUpperLeft + widthGraphBarRectangle;

                tideChartFrame.geometricBounds = [yBarUpperLeft, xBarUpperLeft, yBarLowerLeft, xBarLowerLeft];
            }

            retVal = true;
        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
            reportErrorToUser(context, "Something went wrong in the document setup phase: " + err);
            break;
        }
        
    }
    while (false);
       
    crdtes.logExit(arguments);

    return retVal;
}

function reportErrorToUser(context, message) {

    crdtes.logEntry(arguments);

    crdtes.logError("reportErrorToUser: " + message);

    if (! context.errorMessages) {
        context.errorMessages = "";
    }

    if (context.errorMessages) {
        if (crdtes.IS_MAC) {
            context.errorMessages += "\n";
        }
        else {
            // Windows 'alert()' does not honor new lines
            context.errorMessages += " *** ";
        }
    }
    context.errorMessages += message;

    crdtes.logExit(arguments);
}

function setupDocument(context) {
    
    var retVal = false;

    crdtes.logEntry(arguments);

    do { // non-looping; bail out if something fails with 'break'.
        
        try {
            
            if ("object" != typeof context) {
                break;
            }

            if (app.documents.length == 0) {
                context.errorMessages += "The script needs an active document\n";
                break;
            }
        
            var doc = app.activeDocument;
            if (! (doc instanceof Document)) {
                context.errorMessages += "The script needs an active document\n";
                break;
            }

            context.doc = doc;
            context.noaaStationCode = CST.DEFAULT_NOAA_STATION_CODE;

            var stories = collectionToArray(doc.stories);
            for (var idx = 0; idx < stories.length; idx++)
            {
                var story = stories[idx];
                var contents = story.contents;
                var sentinelPos = contents.toLowerCase().indexOf("[main]");
                
                // Allow for some comments before the main section
                if (sentinelPos >= 0 && sentinelPos < 1024)
                {
                    var config = crdtes.readINI(contents);
                    if (config && config.main)
                    {
                        context.config = config;
                        context.storyWithConfigINIId = story.id;
                    }
                }
            }

            if (context.config && context.config.main) {

                var acceptedAttributes = [
                    "station", 
                    "stationcode", 
                    "noaastation", 
                    "noaastationcode"
                ];

                for (var attrIdx = 0; attrIdx < acceptedAttributes.length; attrIdx++) {

                    var attrName = acceptedAttributes[attrIdx];
                    var noaaStationCode = context.config.main[attrName];
                    if (noaaStationCode !== undefined) {
                        context.noaaStationCode = noaaStationCode;
                        break;
                    }
                }
            }

            retVal = true;
        
        }
        catch (err) {
            crdtes.logError(arguments, "throws " + err);
            reportErrorToUser(context, "Something went wrong in the document setup phase: " + err);
            break;
        }
        
    }
    while (false);
       
    crdtes.logExit(arguments);

    return retVal;
}

function startsWith(s, sStart)
{    
    var retVal = false;

    crdtes.logEntry(arguments);

    do
    {
        try 
        {
            sStart = "" + sStart;
            if (! sStart) {
                retVal = true;
                break;
            }

            s = "" + s;
            if (s.length < sStart.length) {
                retVal = false;
                break;
            }

            retVal = s.substring(0, sStart.length) == sStart;
        }
        catch (err)
        {
            crdtes.logError(arguments, "throws " + err);
        }
    }
    while (false);
     
    crdtes.logExit(arguments);
    
    return retVal;
}
