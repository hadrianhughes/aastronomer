import json
import re
import dateutil.parser


def make_response(status: int, body={}, headers: dict = {}) -> dict:
    """Return a response dict in the format expected by API gateway

    :param status:  The status code of the response
    :param body:    The response body
    :param headers: A dictionary of response headers

    :return: The response dictionary
    :rtype:  dict
    """
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            **headers,
        },
        'body': json.dumps(body)
    }


def valid_id(text: str) -> bool:
    """Return whether a given ID is in the format x-x-x-x

    :param text: The ID to check

    :return: Whether the ID is in the correct format
    :rtype:  bool
    """
    id_rgx = re.compile(r'^\d+-\d+-\d+-\d+$')
    return bool(id_rgx.match(text))


def valid_iso_date(iso: str) -> bool:
    """Return whether a given date string is in the ISO format

    :param iso: Date string to check

    :return: Whether the given date is in the ISO format
    :rtype:  bool
    """
    try:
        dateutil.parser.isoparse(iso)
        return True
    except ValueError:
        return False
