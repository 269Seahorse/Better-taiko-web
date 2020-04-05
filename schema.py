import jsonschema

def validate(data, schema):
    try:
        jsonschema.validate(data, schema)
        return True
    except jsonschema.exceptions.ValidationError:
        return False

register = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'username': {'type': 'string'},
        'password': {'type': 'string'}
    }
}

login = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'username': {'type': 'string'},
        'password': {'type': 'string'},
        'remember': {'type': 'boolean'}
    }
}

update_display_name = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'display_name': {'type': 'string'}
    }
}

update_don = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'body_fill': {'type': 'string'},
        'face_fill': {'type': 'string'}
    }
}

update_password = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'current_password': {'type': 'string'},
        'new_password': {'type': 'string'}
    }
}

delete_account = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'password': {'type': 'string'}
    }
}

scores_save = {
    '$schema': 'http://json-schema.org/schema#',
    'type': 'object',
    'properties': {
        'scores': {
            'type': 'array',
            'items': {'$ref': '#/definitions/score'}
        },
        'is_import': {'type': 'boolean'}
    },
    'definitions': {
        'score': {
            'type': 'object',
            'properties': {
                'hash': {'type': 'string'},
                'score': {'type': 'string'}
            }
        }
    }
}
