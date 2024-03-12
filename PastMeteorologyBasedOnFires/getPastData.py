import os
import pandas as pd
import requests

diasMes = {
    6: 30,
    7: 31,
    8: 31,
    9: 30
}

LAT = 40.1394270001517
LON = -7.50764199998644
END_DATE = "2022-07-05"
YEAR = 2022

url = f"https://archive-api.open-meteo.com/v1/archive?latitude={LAT}&longitude={LON}&start_date={YEAR}-06-20&end_date={END_DATE}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation,rain,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_100m,wind_direction_10m,wind_direction_100m,wind_gusts_10m,soil_temperature_0_to_7cm,soil_temperature_7_to_28cm,soil_temperature_28_to_100cm,soil_temperature_100_to_255cm,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_moisture_28_to_100cm,soil_moisture_100_to_255cm,is_day,sunshine_duration,shortwave_radiation,direct_radiation,diffuse_radiation,direct_normal_irradiance,global_tilted_irradiance,terrestrial_radiation,shortwave_radiation_instant,direct_radiation_instant,diffuse_radiation_instant,direct_normal_irradiance_instant,global_tilted_irradiance_instant,terrestrial_radiation_instant&timezone=GMT"
response = requests.get(url)

print(response)

print(response.status_code)

if((response.status_code == 200)):
    data = response.json()
    df = pd.json_normalize(data)
    df.to_csv(f"sampleTHREE.csv", index=False)