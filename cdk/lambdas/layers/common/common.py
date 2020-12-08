import json
import re
import dateutil.parser

def make_response(status: int, body = {}, headers: dict = {}) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            **headers,
        },
        'body': json.dumps(body)
    }


def valid_id(text: str) -> bool:
    id_rgx = re.compile('^\d+-\d+-\d+-\d+$')
    return bool(id_rgx.match(text))


def valid_iso_date(iso: str) -> bool:
    try:
        dateutil.parser.isoparse(iso)
        return True
    except:
        return False
