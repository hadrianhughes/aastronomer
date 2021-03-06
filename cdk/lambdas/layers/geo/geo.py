import math

EARTH_RADIUS = 6371  # km
ZONE_SIZE = 10  # km
VERTICAL_ZONE_COUNT = 7


def distance_between_points(
    lat1: float,
    lat2: float,
    lon1: float,
    lon2: float
) -> float:
    """Uses the Haversine Formula to get the distance between 2 lat/long pairs

    :param lat1: Latitude of point 1
    :param lat2: Latitude of point 2
    :param lon1: Latitude of point 1
    :param lon2: Latitude of point B

    :return: The distance between the 2 points in km
    :rtype:  float
    """
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)

    sin_halflat_sq = math.sin(dLat / 2) ** 2
    sin_halflon_sq = math.sin(dLon / 2) ** 2
    cos_lat1_rad = math.cos(math.radians(lat1))
    cos_lat2_rad = math.cos(math.radians(lat2))

    a = sin_halflat_sq + cos_lat1_rad * cos_lat2_rad * sin_halflon_sq

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return EARTH_RADIUS * c


def lat_long_from_id(location_id: str) -> (float, float):
    """Derive the latitude and longitude of a given ID to within 10km

    :param location_id: The location ID in format x-x-x-x

    :return: The decimal latitude and longitude of the location
    :rtype: (float, float)
    """
    id_parts = location_id.split('-')
    [lat, long, zone_x, zone_y] = [int(x) for x in id_parts]

    normalised_lat = 90 - lat
    normalised_long = long if long <= 180 else -360 + long

    if zone_y > VERTICAL_ZONE_COUNT - 1:
        return None

    region_width = distance_between_points(
        normalised_lat,
        normalised_lat,
        normalised_long,
        normalised_long + 1
    )

    zone_count = math.ceil(region_width / ZONE_SIZE)

    if zone_x > zone_count - 1:
        return None

    zone_height_degrees = 1 / VERTICAL_ZONE_COUNT
    zone_width_degrees = 1 / zone_count

    zoney_center = (zone_height_degrees * zone_y) + (zone_height_degrees / 2)
    zonex_center = (zone_width_degrees * zone_x) + (zone_width_degrees / 2)

    return (
        normalised_lat + zoney_center,
        normalised_long + zonex_center
    )


def id_from_lat_long(lat: float, long: float) -> str:
    """Return the ID representing the 10x10km square a given lat/lon exists within

    :param lat: The latitude of the location to encode
    :param long: The longitude of the location to encode

    :return: The ID of the 10x10km square in the format x-x-x-x
    :rtype: str
    """
    if lat < -90 or lat > 90 or long < -190 or long > 190:
        return None

    floored_lat = math.floor(lat)
    floored_long = math.floor(long)

    region_width = distance_between_points(
        floored_lat,
        floored_lat,
        floored_long,
        floored_long + 1
    )

    zone_count = math.ceil(region_width / ZONE_SIZE)

    zone_height_degrees = 1 / VERTICAL_ZONE_COUNT
    zone_width_degrees = 1 / zone_count

    zone_x = str(math.floor((long % 1) / zone_width_degrees))
    zone_y = str(math.floor((lat % 1) / zone_height_degrees))

    lat_part = str(90 - floored_lat)
    long_part = str(floored_long if long >= 0 else 360 + floored_long)

    return lat_part + '-' + long_part + '-' + zone_x + '-' + zone_y
