from ..geo import distance_between_points

def test_equator():
    d = distance_between_points(0, 0, 0, 1)

    assert round(d, 1) == 111.2


def test_edinburgh():
    d = distance_between_points(56, 56, -3, -2)

    assert round(d, 1) == 62.2
