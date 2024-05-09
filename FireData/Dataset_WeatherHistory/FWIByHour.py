import pandas as pd
import FWI
import matplotlib.pyplot as plt
import numpy as np
import os
import cfgrib
import xarray as xrs
import math
import calendar

def DistanceTwoPoints(lat1, lon1, lat2, lon2):
    R = 6371e3  # Radius of the Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def find_nearest(lat, lon, latitudes, longitudes):
    min_distance = None
    nearest_point = None

    for lat2, lon2 in zip(latitudes, longitudes):
        distance = DistanceTwoPoints(lat, lon, lat2, lon2)
        if min_distance is None or distance < min_distance:
            min_distance = distance
            nearest_point = (lat2, lon2)

    return min_distance, nearest_point

def find_nearest_index(lat, lon, latitudes, longitudes):
    distances = np.array([DistanceTwoPoints(lat, lon, lat2, lon2) for lat2, lon2 in zip(latitudes, longitudes)])
    sorted_distances_indices = np.argsort(distances)
    nearest_points = [(latitudes[i], longitudes[i]) for i in sorted_distances_indices[:4]]
    min_distances = distances[sorted_distances_indices[:4]]
    return min_distances, nearest_points

def convert_longitude360(lon):
    if lon < 0:
        return lon + 360
    return lon

def convert_longitude(lon):
    if lon > 180:
        return lon - 360
    return lon


def total_precipitation(initial_date, final_date, dmet):
    dmet['hourly.time'] = pd.to_datetime(dmet['hourly.time'])
    dmet_copy = dmet.copy()
    dmet_copy.set_index('hourly.time', inplace=True)
    selected_rows = dmet_copy.loc[initial_date:final_date]
    total_precipitation = selected_rows['hourly.precipitation'].sum()

    return total_precipitation


# In[ ]:


import re

def sort_key(filename):
    match = re.search(r'(\d+)', filename)
    if match:
        return int(match.group(1))
    else:
        return 0

fogos = [f for f in os.listdir("OUTPUT") if f.endswith('.csv')]

fogos = sorted(fogos, key=sort_key)

print(len(fogos))
print(fogos)


# In[ ]:


dfCur = pd.read_csv('OUTPUT/' + fogos[0])
print(dfCur.head())


# In[ ]:


dfInd = pd.read_csv('./NaturalFires/NaturalFires.csv')
print(dfInd.__len__())

print(dfInd.loc[167])


# In[ ]:


#As datas mais para a frente estão mal, tem 2015

def sort_key(filename):
    match = re.search(r'(\d+)', filename)
    if match:
        return int(match.group(1))
    else:
        return 0

fogos = [f for f in os.listdir("OUTPUT") if f.endswith('.csv')]

fogos = sorted(fogos, key=sort_key)

print(len(fogos))
print(fogos)

for j in range(1257, len(fogos)):
    try:
        start_index = 24+12

        mts = {
                1: 31,
                2: 28,
                3: 31,
                4: 30,
                5: 31,
                6: 30,
                7: 31,
                8:31, 
                9:30, 
                10:31,
                11:30,
                12:31}


        dfInd = pd.read_csv('./NaturalFires/NaturalFires.csv')

        dfCurr = pd.read_csv("OUTPUT/" + fogos[j])
        hora = dfCurr['hourly.time'].iloc[start_index]
        print(hora)
        year = hora.split('-')[0]
        print(year)

        
        ds = xrs.open_dataset(f"FWI_HISTORY/{year}.grib", engine='cfgrib')
        print(ds)

        fwinx_at_time = ds['fwinx'].sel(time=f'{hora}')

        print(fwinx_at_time)

        latitudes = fwinx_at_time.latitude
        longitudes = fwinx_at_time.longitude

        print(latitudes.values)
        print(len(latitudes.values))
        print(longitudes.values)
        print(len(longitudes.values))

        novas_lat = []
        novas_lon = []
        for lat in range(len(latitudes)):
            for lon in range(len(longitudes)):
                novas_lat.append(latitudes[lat].values)
                novas_lon.append(longitudes[lon].values)


        LATITUDE_SING = dfInd.iloc[j]['latitude']
        LONGITUDE_SING = dfInd.iloc[j]['longitude']
        min_distance, nearest_point = find_nearest(LATITUDE_SING, convert_longitude360(LONGITUDE_SING), novas_lat, novas_lon)
        print(min_distance, nearest_point)

        print("Latitude: ", nearest_point[0])
        print("Longitude: ", nearest_point[1])

        fwinx_value = ds['fwinx'].sel(time=f'{hora}', latitude=nearest_point[0], longitude=nearest_point[1])
        drtcode_value = ds['drtcode'].sel(time=f'{hora}', latitude=nearest_point[0], longitude=nearest_point[1])
        dufmcode_value = ds['dufmcode'].sel(time=f'{hora}', latitude=nearest_point[0], longitude=nearest_point[1])
        ffmcode_value = ds['ffmcode'].sel(time=f'{hora}', latitude=nearest_point[0], longitude=nearest_point[1])

        
        LAT = nearest_point[0]
        FFMCPrev = ffmcode_value.values.item()
        DMCPrev = dufmcode_value.values.item()
        DCPrev = drtcode_value.values.item()

        fwix_values = [None] * len(dfCurr)
        ffmc_values = [None] * len(dfCurr)
        dmc_values = [None] * len(dfCurr)
        dc_values = [None] * len(dfCurr)
        isi_values = [None] * len(dfCurr)
        bui_values = [None] * len(dfCurr)

        

        dfCurr['hourly.time'] = pd.to_datetime(dfCurr['hourly.time'])

        min_date = dfCurr['hourly.time'].min()
        max_date = dfCurr['hourly.time'].max()

        for i in range(start_index, len(dfCurr)):
                MONTH = dfCurr.iloc[i]['hourly.time'].month
                DAY = dfCurr.iloc[i]['hourly.time'].day
                HOUR = dfCurr.iloc[i]['hourly.time'].hour
                year = dfCurr.iloc[i]['hourly.time'].year

                print("$-->", MONTH, DAY, HOUR, year)

                TEMP = dfCurr.iloc[i]['hourly.temperature_2m']
                RH = dfCurr.iloc[i]['hourly.relative_humidity_2m']
                WIND = dfCurr.iloc[i]['hourly.wind_speed_10m']


                if(calendar.isleap(int(year))):
                    mts[2] = 29
                else:
                    mts[2] = 28

                if(int(HOUR) < 10):
                    HOUR = '0' + str(HOUR)


                if(int(DAY) == 1):
                    if(int(MONTH) == 1):
                        LAST_DAY = mts[12]
                        LAST_MONTH = '12'
                        initial_date = f'{str(int(year) - 1)}-{LAST_MONTH}-{LAST_DAY}T{HOUR}:00'
                        final_date = f'{year}-{MONTH}-{DAY}T{HOUR}:00'
                    else:
                        LAST_DAY = mts[int(MONTH) - 1]
                        LAST_MONTH = str(int(MONTH) - 1)

                        if(int(LAST_MONTH) < 10):
                            LAST_MONTH = '0' + str(int(LAST_MONTH))
                            
                        initial_date = f'{year}-{LAST_MONTH}-{LAST_DAY}T{HOUR}:00'
                        final_date = f'{year}-{MONTH}-{DAY}T{HOUR}:00'

                elif((int(DAY) < 10) and (int(DAY) > 1)):
                    id = '0' + str(int(DAY)-1)
                    fd = '0' + str(int(DAY))

                    initial_date = f'{year}-{MONTH}-{id}T{HOUR}:00'
                    final_date = f'{year}-{MONTH}-{fd}T{HOUR}:00'
                else:
                    id = str(int(DAY)-1)
                    fd = str(int(DAY))

                    initial_date = f'{year}-{MONTH}-{id}T{HOUR}:00'
                    final_date = f'{year}-{MONTH}-{fd}T{HOUR}:00'

            
                print("Initial Date: ", initial_date)
                print("Final Date: ", final_date)

                initial_date_dt = pd.to_datetime(initial_date)
                final_date_dt = pd.to_datetime(final_date)

                

                if min_date <= initial_date_dt <= max_date:
                    if(int(HOUR) == 12):
                        print("Este caso")
                        hora_reset = dfCurr.iloc[i]['hourly.time']
                        fwinx_value = ds['fwinx'].sel(time=f'{hora_reset}', latitude=nearest_point[0], longitude=nearest_point[1])
                        drtcode_value = ds['drtcode'].sel(time=f'{hora_reset}', latitude=nearest_point[0], longitude=nearest_point[1])
                        dufmcode_value = ds['dufmcode'].sel(time=f'{hora_reset}', latitude=nearest_point[0], longitude=nearest_point[1])
                        ffmcode_value = ds['ffmcode'].sel(time=f'{hora_reset}', latitude=nearest_point[0], longitude=nearest_point[1])
                        bui_value = ds['fbupinx'].sel(time=f'{hora_reset}', latitude=nearest_point[0], longitude=nearest_point[1])
                        isi_value = ds['infsinx'].sel(time=f'{hora_reset}', latitude=nearest_point[0], longitude=nearest_point[1])

                        FFMCPrev = ffmcode_value.values.item()
                        DMCPrev = dufmcode_value.values.item()
                        DCPrev = drtcode_value.values.item()

                        fwix_values[i] = fwinx_value.values.item()
                        ffmc_values[i] = FFMCPrev
                        dmc_values[i] = DMCPrev
                        dc_values[i] = DCPrev
                        isi_values[i] = isi_value.values.item()
                        bui_values[i] = bui_value.values.item()
                        



                    else:
                        RAIN = total_precipitation(initial_date, final_date, dfCurr)
                        FFMCPrev = FWI.FFMC(TEMP,RH,WIND,RAIN,FFMCPrev)
                        DMCPrev = FWI.DMC(TEMP,RH,RAIN,DMCPrev,LAT,int(MONTH))
                        DCPrev = FWI.DC(TEMP,RAIN,DCPrev,LAT,int(MONTH))
                        isi = FWI.ISI(WIND, FFMCPrev)
                        bui = FWI.BUI(DMCPrev,DCPrev)
                        fwix = FWI.FWI(isi, bui)

                        print("RAIN: ", RAIN)
                        print("FFMC: ", FFMCPrev)
                        print("DMC: ", DMCPrev)
                        print("DC: ", DCPrev)
                        print("ISI: ", isi)
                        print("BUI: ", bui)
                        print("FWI: ", fwix)

                        fwix_values[i] = fwix
                        ffmc_values[i] = FFMCPrev
                        dmc_values[i] = DMCPrev
                        dc_values[i] = DCPrev
                        isi_values[i] = isi
                        bui_values[i] = bui
                else:
                    print(f"Initial date {initial_date} is not within the range of dates in the DataFrame.")
                    break


        dfCurr['fwix'] = fwix_values
        dfCurr['ffmc'] = ffmc_values
        dfCurr['dmc'] = dmc_values
        dfCurr['dc'] = dc_values
        dfCurr['isi'] = isi_values
        dfCurr['bui'] = bui_values


        dfCurr.to_csv(f'OUTPUTFWI/{fogos[j]}', index=False)
    except: 
        with open("errors.txt", "a") as fx:
            fx.write(f'{j}' + ",")
    


# In[ ]:


year = 2024

mts = {
        1: 31,
        2: 28,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8:31, 
        9:30, 
        10:31,
        11:30,
        12:31}


if(calendar.isleap(int(year))):
    mts[2] = 29

print(mts[2])

