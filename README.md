# IDTideChart

(c) 2024 Kris Coppieters - Rorohiko Ltd.

This sample ready-to-run ExtendScript for InDesign uses data from NOAA (National Oceanic and Atmospheric Administration)
to render a live one-page 24-hour tide chart for a designated location on a coast of the USA.

<img width="1847" alt="Screenshot 2024-10-01 at 9 40 13 AM" src="https://github.com/user-attachments/assets/57fe9c0c-c884-457d-bcea-600e29124672">

This script serves as a demo of _JSXGetURL_. More info here:

    https://rorohiko.com/jsxgeturl

Server versions of _JSXGetURL_ are also available:

    https://rorohiko.com/sjsxgeturl

`TideChart.jsx` uses _JSXGetURL_ to query the APIs located at https://api.tidesandcurrents.noaa.gov/

_JSXGetURL_ is a native ExtendScript module which embeds CURL, and it allows the script to use CURL 
in-process, which has less overheads than accessing web APIs by way of an external process.

More info about CURL: https://curl.se/docs/manpage.html

Before you can run the script, you need to determine which NOAA tide station you want to use.

First, visit 

	https://tidesandcurrents.noaa.gov/

and use the interactive map to find a tide station.

Pay attention to the type of station you select: there are also stations for current, 
temperature and other types of measurements and these won't be able to provide tide information. 

Example tide station codes:

```
San Francisco, California:      9414290
South Port Everglades, Florida: 8722956
Atlantic City, New Jersey:      8534720
```

If have a station code at hand and you want to get more info about that particular station,
visit the following URL (replacing _STATIONCODE_ with the actual station code):

	https://tidesandcurrents.noaa.gov/stationhome.html?id=STATIONCODE

## Installing

Download the script from the Releases folder in this repo. Go to

[https://github.com/zwettemaan/IDTideMap/tree/main/Releases/IDTideChart.0.0.5.zip
](https://github.com/zwettemaan/IDTideMap/blob/main/Releases/IDTideChart.0.0.5.zip)

and then click the small download button near the top right.

<img width="1041" alt="Screenshot 2024-10-01 at 9 20 38 AM" src="https://github.com/user-attachments/assets/1ac88f35-bcf7-456d-80dc-146b7aef88d3">

Unzip the release _IDTideChart...zip_ file (on Windows, use Right-click, Extract All...; on Mac, double-click the .zip).

Find and copy the `TideChart.idml` to a convenient location, e.g. your desktop.

Launch InDesign, and make the _Scripts_ panel visible (_Window - Utilities - Scripts_ menu).

Right-click on the _User_ entry on the _Scripts_ panel, and select _Reveal in Finder_ or _Reveal in Explorer_.

In the Finder or Explorer, copy or move the whole unzipped _IDTideChart.x.y.z_ folder _into_ the _Scripts Panel_ folder. 

Switch back to InDesign. You should now be able to see the _IDTideChart.x.y.z_ entry inside the _User_ entry on the 
_Scripts_ panel.

## Using

Use InDesign to open the _TideChart.idml_ file.

Check the pasteboard area on the left. Adjust the station code in the configuration frame on the InDesign pasteboard.

On the _Scripts_ panel, open up the _IDTideChart_ entry and double-click _TideChart.jsx_

A tide chart for the next 24 hours should be created.

If you want to adjust the tide station code and re-run the script, you don't need to revert back to a blank template. 

Simply adjust the station code and re-run. The script will clear the previous output and re-render with the newly selected
tide station code.

## Demo version of JSXGetURL

By default, the script will use JSXGetURL in demo mode. JSXGetURL in demo mode is limited to five API calls,
after which you need to relaunch InDesign, in order to get another five API calls.

If you have an license for JSXGetURL, you can activate it on your workstation, and that will lift the
restrictions.

## Juicy bits in the sample code

Look for references to `getURL` in the `TideChart.jsx` source code.
