#!/usr/bin/env node

/* eslint-disable no-console */

'use strict';

const meow = require('meow');
const main = require('..');

const cli = meow(`
  Usage
    get-tile <z> <x> <y> [OPTOINS]

  Options
    --mapid, -i   the mapid, default is mapbox.mapbox-streets-v7
    --output, -o  the path to an output file, default is a file in the working directory
    --mbtiles, -m if specified, tile will be written to this mbtiles file
    --token, -t   the access token to use to make the request, read from environment if not specified
    --gzip, -z    save the tile gzipped, default is to gunzip
`, {
  alias: {
    i: 'mapid',
    o: 'output',
    m: 'mbtiles',
    t: 'token',
    z: 'gzip'
  },
  string: ['mapid', 'output', 'mbtiles', 'token'],
  boolean: ['gzip']
});

const z = cli.input[0];
const x = cli.input[1];
const y = cli.input[2];
const mapid = main.defaultMap(cli.flags.mapid);
const token = main.accessToken(cli.flags.token);
const mbtiles = cli.flags.mbtiles;
let output = cli.flags.output || main.defaultFile(mapid, z, x, y);
if (cli.flags.gzip) output += '.gz';

main.getTile(mapid, token, z, x, y)
  .then((data) => { return cli.flags.gzip ? main.gzip(data) : data; })
  .then((data) => {
    if (!mbtiles) return main.writeFile(output, data);

    return main.getMetadata(mapid, token)
      .then((metadata) => main.writeMbtiles(mbtiles, z, x, y, data, metadata));
  })
  .then((filepath) => console.log(filepath))
  .catch((err) => console.error(err.stack));
