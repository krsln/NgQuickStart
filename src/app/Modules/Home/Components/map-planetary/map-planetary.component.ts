/// <reference types="@types/googlemaps" /> // [Angular 6+]
// import {} from '@types/googlemaps'; // [Angular 5-]
import {Component, OnInit, ViewChild} from '@angular/core';

/*npm install --save @types/googlemaps*/
@Component({
  selector: 'app-map-planetary',
  templateUrl: './map-planetary.component.html',
  styleUrls: ['./map-planetary.component.css']
})
export class MapPlanetaryComponent implements OnInit {
  @ViewChild('gMap', {static: true}) gMap: any;
  map: google.maps.Map;

  constructor() {
  }

  ngOnInit() {
    this.Initialize();
  }

  Initialize() {
    const mapTypes = this.MapTypes();

    let map = this.map;
    const mapTypeIds = [];

    // Setup a copyright/credit line, emulating the standard Google style
    const creditNode = document.createElement('div');
    creditNode.id = 'credit-control';
    creditNode.style.fontSize = '11px';
    creditNode.style.fontFamily = 'Arial, sans-serif';
    creditNode.style.margin = '0 2px 2px 0';
    creditNode.style.whiteSpace = 'nowrap';
    // @ts-ignore
    creditNode.index = 0;

    function setCredit(credit) {
      creditNode.innerHTML = credit + ' -';
    }

    const targetDiv = this.gMap.nativeElement;

    function initialize() {

      // push all mapType keys in to a mapTypeId array to set in the mapTypeControlOptions
      Object.entries(mapTypes).forEach(([key, value]) => {
        mapTypeIds.push(key);
      });

      const mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(0, 0),
        mapTypeControlOptions: {
          mapTypeIds: mapTypeIds,
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }
      };
      map = new google.maps.Map(targetDiv, mapOptions);

      // push the credit/copyright custom control
      map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(creditNode);

      // add the new map types to map.mapTypes

      Object.entries(mapTypes).forEach(([key, value]) => {
        map.mapTypes.set(key, new google.maps.ImageMapType(mapTypes[key]));
      });


      // handle maptypeid_changed event to set the credit line
      google.maps.event.addListener(map, 'maptypeid_changed', () => {
        setCredit(mapTypes[map.getMapTypeId()].credit);
      });

      // start with the moon map type
      map.setMapTypeId('moon');
    }

    initialize();
  }

  MapTypes() {
    const mapTypes = {};
    // set up the map types
    mapTypes['moon'] = {
      getTileUrl: (coord, zoom) => {
        return getHorizontallyRepeatingTileUrl(coord, zoom, (coord, zoom) => {
          const bound = Math.pow(2, zoom);
          return 'http://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw/' +
            +zoom + '/' + coord.x + '/' + (bound - coord.y - 1) + '.jpg';
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 9,
      minZoom: 0,
      radius: 1738000,
      name: 'Moon',
      credit: 'Image Credit: NASA/USGS'
    };

    mapTypes['sky'] = {
      getTileUrl: (coord, zoom) => {
        return getHorizontallyRepeatingTileUrl(coord, zoom, (coord, zoom) => {
          return 'http://mw1.google.com/mw-planetary/sky/skytiles_v1/' +
            coord.x + '_' + coord.y + '_' + zoom + '.jpg';

        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 13,
      radius: 57.2957763671875,
      name: 'Sky',
      credit: 'Image Credit: SDSS, DSS Consortium, NASA/ESA/STScI'
    };

    mapTypes['mars_elevation'] = {
      getTileUrl: (coord, zoom) => {
        return getHorizontallyRepeatingTileUrl(coord, zoom, (coord, zoom) => {
          return getMarsTileUrl('http://mw1.google.com/mw-planetary/mars/elevation/', coord, zoom);
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 8,
      radius: 3396200,
      name: 'Mars Elevation',
      credit: 'Image Credit: NASA/JPL/GSFC'
    };

    mapTypes['mars_visible'] = {
      getTileUrl: (coord, zoom) => {
        return getHorizontallyRepeatingTileUrl(coord, zoom, (coord, zoom) => {
          return getMarsTileUrl('http://mw1.google.com/mw-planetary/mars/visible/', coord, zoom);
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 9,
      radius: 3396200,
      name: 'Mars Visible',
      credit: 'Image Credit: NASA/JPL/ASU/MSSS'
    };

    mapTypes['mars_infrared'] = {
      getTileUrl: (coord, zoom) => {
        return getHorizontallyRepeatingTileUrl(coord, zoom, (coord, zoom) => {
          return getMarsTileUrl('http://mw1.google.com/mw-planetary/mars/infrared/', coord, zoom);
        });
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: false,
      maxZoom: 9,
      radius: 3396200,
      name: 'Mars Infrared',
      credit: 'Image Credit: NASA/JPL/ASU'
    };


    // Normalizes the tile URL so that tiles repeat across the x axis (horizontally) like the
    // standard Google map tiles.
    function getHorizontallyRepeatingTileUrl(coord, zoom, urlfunc) {
      let y = coord.y;
      let x = coord.x;

      // tile range in one direction range is dependent on zoom level
      // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
      let tileRange = 1 << zoom;

      // don't repeat across y-axis (vertically)
      if (y < 0 || y >= tileRange) {
        return null;
      }

      // repeat across x-axis
      if (x < 0 || x >= tileRange) {
        x = (x % tileRange + tileRange) % tileRange;
      }

      return urlfunc({x: x, y: y}, zoom);
    }

    function getMarsTileUrl(baseUrl, coord, zoom) {
      let bound = Math.pow(2, zoom);
      let x = coord.x;
      let y = coord.y;
      let quads = ['t'];

      for (var z = 0; z < zoom; z++) {
        bound = bound / 2;
        if (y < bound) {
          if (x < bound) {
            quads.push('q');
          } else {
            quads.push('r');
            x -= bound;
          }
        } else {
          if (x < bound) {
            quads.push('t');
            y -= bound;
          } else {
            quads.push('s');
            x -= bound;
            y -= bound;
          }
        }
      }

      return baseUrl + quads.join('') + '.jpg';
    }

    return mapTypes;
  }

}
