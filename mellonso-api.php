<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$dataFile = 'mellonso-data.json';

// Initialize data file if it doesn't exist
if (!file_exists($dataFile)) {
    $initialData = [
        'mellonsoConfig' => [
            'stats' => [
                'heritageYears' => 0,
                'masterCraftsmen' => 1,
                'exclusivePieces' => 3,
                'globalPresence' => 1,
                'satisfiedCustomers' => 0,
                'farmsBuilt' => 0
            ],
            'melonCounter' => [
                'current' => 0,
                'maxType' => 'none',
                'maxValue' => null
            ],
            'masterpieces' => [],
            'statsBackgrounds' => [],
            'farms' => [],
            'particleImage' => null,
            'textColors' => []
        ],
        'contactRequests' => [],
        'lastModified' => date('c')
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Return current MELLONSO data
        $data = json_decode(file_get_contents($dataFile), true);
        echo json_encode($data);
        break;
        
    case 'POST':
        // Update MELLONSO data
        $input = json_decode(file_get_contents('php://input'), true);
        
        if ($input) {
            $input['lastModified'] = date('c');
            file_put_contents($dataFile, json_encode($input, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true, 'message' => 'MELLONSO data saved successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
        }
        break;
        
    case 'PUT':
        // Partial update
        $input = json_decode(file_get_contents('php://input'), true);
        $data = json_decode(file_get_contents($dataFile), true);
        
        if ($input && isset($input['section'])) {
            $section = $input['section'];
            $value = $input['value'];
            
            $data[$section] = $value;
            $data['lastModified'] = date('c');
            
            file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true, 'message' => 'MELLONSO section updated successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid update data']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}
?>
