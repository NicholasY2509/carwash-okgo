<?php
require 'vendor/autoload.php';
$generator = new Picqer\Barcode\BarcodeGeneratorPNG();
echo base64_encode($generator->getBarcode('123456', $generator::TYPE_CODE_128));
