import astropy.units as u
from astropy.coordinates import get_body, EarthLocation, AltAz
from astropy.time import Time

celestial_objects = [
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune'
]


def get_object(objectName, earthPos, time):
    """Get the altitude and azimuth of an object at a given time and location

    :param objectName: Name of the target object
    :param earthPos:   Latitude and Longitude of the observation location
    :param time:       Time of observation
    :type objectName:  string
    :type earthPos:    (float, float)
    :type time:        string

    :return: A dict containing the altitude and azimuth of the object
    :rtype:  { 'alt': float, 'az': float }
    """

    (lat, long) = earthPos
    astroTime   = Time(time)
    objectCoord = get_body(objectName, astroTime)
    earthCoord  = EarthLocation(lat=lat*u.deg, lon=long*u.deg)

    observation_frame = AltAz(obstime=astroTime, location=earthCoord)
    object_alt_az     = objectCoord.transform_to(observation_frame)

    return { 'alt': object_alt_az.alt.deg, 'az': object_alt_az.az.deg }


def get_all_objects(earthPos, time):
    """Get the result of get_object for all available celestial objects

    :param earthPos: Latitude and Longitude of the observation location
    :param time:     Time of observation
    :type earthPos:  (float, float)
    :type time:      string

    :return: A list of dicts containing the name, altitude and azimuth of each object
    :rtype:   list({ 'object': string, 'alt': float, 'az': float })
    """

    alt_azs = []
    for obj in celestial_objects:
        aa = get_object(obj, earthPos, time)
        alt_azs.append({ **aa, 'object': obj })

    return alt_azs
