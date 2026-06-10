<?php

$dir = __DIR__ . '/app/Models';
$files = glob($dir . '/*.php');

foreach ($files as $file) {
    if (basename($file) === 'User.php') continue; // already fixed

    $content = file_get_contents($file);
    
    // Replace 'extends ModelBase' with 'extends Model'
    if (strpos($content, 'extends ModelBase') !== false) {
        $content = str_replace('extends ModelBase', 'extends Model', $content);
        
        // Add use Illuminate\Database\Eloquent\Model; if not there
        if (strpos($content, 'use Illuminate\Database\Eloquent\Model;') === false) {
            $content = str_replace(
                "namespace App\Models;\n",
                "namespace App\Models;\n\nuse Illuminate\Database\Eloquent\Model;\n",
                $content
            );
        }
        
        file_put_contents($file, $content);
        echo "Fixed " . basename($file) . "\n";
    }
}
echo "Done.\n";
