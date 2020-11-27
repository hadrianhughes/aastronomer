import math

EARTH_RADIUS = 6371 #km

# Haversine Formula
def distance_between_points(lat1: float, lat2: float, lon1: float, lon2: float):
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    a = (math.sin(dLat / 2) ** 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dLon / 2) ** 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return EARTH_RADIUS * c


def lat_long_from_id(location_id: str):
    id_parts = location_id.split('-')
    [lat, long, zone_x, zone_y] = [int(x) for x in id_parts]
