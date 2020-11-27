import math

EARTH_RADIUS = 6371 #km
ZONE_SIZE = 10 #km
VERTICAL_ZONE_COUNT = 7

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

    normalised_lat = 90 - lat
    normalised_long = long if long <= 180 else -360 + long

    if zone_y > VERTICAL_ZONE_COUNT - 1:
        return None

    region_width = distance_between_points(normalised_lat, normalised_lat, normalised_long, normalised_long + 1)
    zone_count = math.ceil(region_width / ZONE_SIZE)

    if zone_x > zone_count - 1:
        return None

    zone_height_degrees = 1 / VERTICAL_ZONE_COUNT
    zone_width_degrees = 1 / zone_count

    return (normalised_lat + (zone_height_degrees * zone_y) + (zone_height_degrees / 2), normalised_long + (zone_width_degrees * zone_x) + (zone_width_degrees / 2))
