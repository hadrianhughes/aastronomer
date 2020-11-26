from getVisibleByID.index import handler

def make_request(location_id):
    return {
        'pathParameters': {
            'locationID': location_id
        }
    }


def test_success():
    test_id = '10-20-30-40'

    response = handler(make_request(test_id), {})

    assert response['statusCode'] == 200


def test_bad_id():
    test_id = '10-20-30'

    response = handler(make_request(test_id), {})

    assert response['statusCode'] == 400
