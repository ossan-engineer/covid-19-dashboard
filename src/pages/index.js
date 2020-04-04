import React, { useRef } from 'react';
import Helmet from 'react-helmet';
import L, { latLng } from 'leaflet';
import axios from 'axios';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    try {
      const res = await axios.get('https://corona.lmao.ninja/countries');
      const countries = res.data || [];
      const hasData = Array.isArray(countries) && countries.length > 0;

      if (!hasData) {
        return;
      }

      const geoJson = {
        type: 'FeatureCollection',
        features: countries.map((country = {}) => {
          const { countryInfo = {} } = country;
          const { lat, long: lng } = countryInfo;
          return {
            type: 'Feature',
            properties: {
              ...country,
            },
            geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
          };
        }),
      };
      console.log(geoJson);

      const geoJsonLayers = new L.GeoJSON(geoJson, {
        pointToLayer: (feature = {}, latlng) => {
          const { properties = {} } = feature;
          let updatedFormatted;
          let casesString;

          const { country, updated, cases, deaths, recovered } = properties;

          casesString = `${cases}`;

          if (cases > 1000) {
            casesString = `${casesString.slice(0, -3)}k+`;
          }

          if (updated) {
            updatedFormatted = new Date(updated).toLocaleString();
          }

          const html = `
          <span class="icon-marker ${cases <= 1000 && 'light'}">
            <span class="icon-marker-tooltip">
              <h2>${country}</h2>
              <ul>
                <li><strong>Confirmed:</strong> ${cases}</li>
                <li><strong>Deaths:</strong> ${deaths}</li>
                <li><strong>Recovered:</strong> ${recovered}</li>
                <li><strong>Last Update:</strong> ${updatedFormatted}</li>
              </ul>
            </span>
            ${casesString}
          </span>
        `;

          return L.marker(latlng, {
            icon: L.divIcon({
              className: 'icon',
              html,
            }),
            riseOnHover: true,
          });
        },
      });

      geoJsonLayers.addTo(map);
    } catch (e) {
      console.error(`Failed to fetch countries: ${e.message}, e`);
    }
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      <Map {...mapSettings}></Map>
    </Layout>
  );
};

export default IndexPage;
