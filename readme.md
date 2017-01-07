# get-tile

Get a vector tile from Mapbox.

## You need

- A valid access token
- node.js ^4.x
- [optional] a map id. Defaults to mapbox-streets

## Usage

```
》./bin/get-tile.js --help

  Get a vector tile

  Usage
    get-tile <z> <x> <y> [OPTOINS]

  Options
    --mapid, -i   the mapid, default is mapbox.mapbox-streets-v7
    --output, -o  the path to an output file, default is a file in the working directory
    --mbtiles, -m if specified, tile will be written to this mbtiles file
    --token, -t   the access token to use to make the request, read for environment if not specified
    --gzip, -z    save the tile gzipped, default is to gunzip
```
