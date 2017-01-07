'use strict';

const zlib = require('zlib');
const fs = require('fs');
const got = require('got');
const Mbtiles = require('mbtiles');

module.exports.defaultMap = (mapid) => {
  return mapid || 'mapbox.mapbox-streets-v7';
};

module.exports.accessToken = (token) => {
  return token || process.env.MAPBOX_ACCESS_TOKEN || process.env.MapboxAccessToken;
};

module.exports.getTile = (mapid, token, z, x, y) => {
  const url = `https://api.mapbox.com/v4/${mapid}/${z}/${x}/${y}.vector.pbf?access_token=${token}`;
  return got(url, { encoding: null })
    .then((response) => response.body);
};

module.exports.defaultFile = (mapid, z, x, y) => {
  return `${z}-${x}-${y}-${mapid}.mvt`;
};

module.exports.writeFile = (filepath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, (err) => {
      if (err) return reject(err);
      resolve(filepath);
    });
  });
};

module.exports.gzip = (data) => {
  return new Promise((resolve, reject) => {
    zlib.gzip(data, (err, unzipped) => {
      if (err) return reject(err);
      resolve(unzipped);
    });
  });
};

module.exports.getMetadata = (mapid, token) => {
  const url = `https://api.mapbox.com/v4/${mapid}.json?access_token=${token}`;
  return got(url, { encoding: 'utf8' })
    .then((response) => {
      const metadata = JSON.parse(response.body);
      delete metadata.tiles;
      return metadata;
    });
};

module.exports.writeMbtiles = (filepath, z, x, y, data, metadata) => {
  return new Promise((resolve, reject) => {
    new Mbtiles(filepath, (err, src) => {
      if (err) return reject(err);
      resolve(src);
    });
  }).then((src) => new Promise((resolve, reject) => {
    src.startWriting((err) => {
      if (err) return reject(err);
      resolve(src);
    });
  })).then((src) => new Promise((resolve, reject) => {
    src.putTile(z, x, y, data, (err) => {
      if (err) return reject(err);
      resolve(src);
    });
  })).then((src) => new Promise((resolve, reject) => {
    if (!metadata) return src;

    src.putInfo(metadata, (err) => {
      if (err) return reject(err);
      resolve(src);
    });
  })).then((src) => new Promise((resolve, reject) => {
    src.stopWriting((err) => {
      if (err) return reject(err);
      resolve(filepath);
    });
  }));
};
