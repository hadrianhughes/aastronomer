import json

def make_response(status: int, body = {}, headers: dict = {}):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            **headers,
        },
        'body': json.dumps(body)
    }
