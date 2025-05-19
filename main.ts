import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod'


// 1.- Crear cliente 
// Maneja la conexión entre el cliente y el servidor

const server = new McpServer({
  name: 'Demo',
  version: '1.0.0'

})

// 2.- Define las herramientas del servidor
server.tool('fetch-weather', // titulo de la herramienta
  'Tool to fetch the weather of a city', // descripción de la herramienta
  {
    city: z.string().describe('City name'), // argumentos 
    countryCode: z.string().describe('Country code based on ISO-3166-1 alpha2'),

  },
  async ({ city, countryCode }) => {

    const responseGeocoding = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json&countryCode=${countryCode}`)

    const dataGeocodingComplete = await responseGeocoding.json()
    const dataGeocoding = dataGeocodingComplete.results

    if (!dataGeocoding?.length) {



      return {
        content: [
          {
            type: 'text',
            text: `No se encontró información para la ciudad ${city} y el código de país ${countryCode}`
          }
        ]
      }
    }


    const { latitude, longitude } = dataGeocoding[0]


    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=uv_index_max,precipitation_probability_max,precipitation_sum,precipitation_hours&hourly=temperature_2m,rain&current=temperature_2m,precipitation,rain,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cloud_cover`)

    const weatherData = await weatherResponse.json()



    return {
      content: [{
        type: 'text',
        text: JSON.stringify(weatherData, null, 2)
      }]
    }

  }
)

//3.- Escuchar las conexiones del cliente 
const transport = new StdioServerTransport()
server.connect(transport)