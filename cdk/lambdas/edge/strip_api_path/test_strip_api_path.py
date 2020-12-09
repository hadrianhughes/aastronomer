from .index import handler

def make_request(uri: str) -> dict:
    return {
        'Records': [
            {
                'cf': {
                    'request': {
                        'uri': uri
                    }
                }
            }
        ]
    }


def test_success():
    stripped = handler(make_request('/api/test-path'), {})
    assert stripped['uri'] == '/test-path'


def test_not_api():
    noop = handler(make_request('/test-path'), {})
    assert noop['uri'] == '/test-path'


def test_multiple_api():
    stripped = handler(make_request('/api/api/test-path'), {})
    assert stripped['uri'] == '/api/test-path'
