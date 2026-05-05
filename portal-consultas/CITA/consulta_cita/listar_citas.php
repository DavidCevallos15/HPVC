<?php
include_once('cls/buscar_ws.php');


$buscar=array(chr(13).chr(10), "\r\n", "\n", "\r","<BR>","INSERT INTO","DELETE","UPDATE",",","'");
$reemplazar=array("", "", "", "", "-","-", "-","-","-","");

$documento=trim(str_ireplace($buscar,$reemplazar,strtoupper ($_GET["id"])));//1350342455
$fecha=trim(str_ireplace($buscar,$reemplazar,strtoupper ($_GET["fec"])));

$buscar2=array("ico1*");
$reemplazar2=array("<img src='img/iconos/file_extension_pdf.png' width='32' height='32'>");
if($documento=='1311972221'){

echo 
'[{"num":"1","id_cita":"-","ico1":"'."<img src='img/iconos/file_extension_pdf.png' width='32' height='32'>".'","tipo_cita":"SUBSECUENTE","nom_medico":"Daniel Arteaga","nom_especi":"Cardiologia","fecha_cita":"13/05/2020","hora_cita":"08:00","doc_paci":"000000000","nom_paci":"Erick Daniel  Arteaga Sanchez","estado":"-","id_estado":"-","id_paciente":"-","fecha_naci":"-","anios":"-","meses":"-","dias":"-","id_tipo_c":"1","tipo_c":"PRESENCIAL","bnt_tipo_c":"'."<img src='img/iconos/session_idle_time_h.png' width='32' height='32'>".'","cod_cita":"-"},'.
'{"num":"2","id_cita":"-","ico1":"'."<img src='img/iconos/file_extension_pdf.png' width='32' height='32'>".'","tipo_cita":"SUBSECUENTE","nom_medico":"Jose Subiaga","nom_especi":"Medicina Interna","fecha_cita":"14/05/2020","hora_cita":"08:00","doc_paci":"000000000","nom_paci":"Erick Daniel  Arteaga Sanchez","estado":"-","id_estado":"-","id_paciente":"-","fecha_naci":"-","anios":"-","meses":"-","dias":"-","id_tipo_c":"2","tipo_c":"VIDEO CONSULTA","bnt_tipo_c":"'."<img src='img/iconos/session_idle_time.png' width='32' height='32'>".'","cod_cita":"HPVC-2020"},'.
'{"num":"3","id_cita":"-","ico1":"'."<img src='img/iconos/file_extension_pdf.png' width='32' height='32'>".'","tipo_cita":"SUBSECUENTE","nom_medico":"Jose Arteaga","nom_especi":"Odontologia","fecha_cita":"15/05/2020","hora_cita":"08:00","doc_paci":"000000000","nom_paci":"Erick Arteaga","estado":"-","id_estado":"-","id_paciente":"-","fecha_naci":"-","anios":"-","meses":"-","dias":"-","id_tipo_c":"3","tipo_c":"LLAMADA TELEFONICA","bnt_tipo_c":"'."<img src='img/iconos/session_idle_time_h.png' width='32' height='32'>".'","cod_cita":"-"}]'
;
return;
}
if($documento=='1311972224'){
echo '[{"num":"1","id_cita":"-","ico1":"'."<img src='img/iconos/file_extension_pdf.png' width='32' height='32'>".'","tipo_cita":"SUBSECUENTE","nom_medico":"Daniel Arteaga","nom_especi":"Cardiologia","fecha_cita":"15/05/2020","hora_cita":"08:00","doc_paci":"000000000","nom_paci":"Erick Daniel  Arteaga Sanchez","estado":"-","id_estado":"-","id_paciente":"-","fecha_naci":"-","anios":"-","meses":"-","dias":"-","id_tipo_c":"1","tipo_c":"PRESENCIAL","bnt_tipo_c":"'."<img src='img/iconos/session_idle_time_h.png' width='32' height='32'>".'","cod_cita":"-"}]';
return;
}
if($documento=='1311972223'){
echo '[{"num":"1","id_cita":"-","ico1":"'."<img src='img/iconos/file_extension_pdf.png' width='32' height='32'>".'","tipo_cita":"SUBSECUENTE","nom_medico":"Daniel Arteaga","nom_especi":"Cardiologia","fecha_cita":"15/05/2020","hora_cita":"08:00","doc_paci":"000000000","nom_paci":"Erick Arteaga","estado":"-","id_estado":"-","id_paciente":"-","fecha_naci":"-","anios":"-","meses":"-","dias":"-","id_tipo_c":"3","tipo_c":"LLAMADA TELEFONICA","bnt_tipo_c":"'."<img src='img/iconos/session_idle_time_h.png' width='32' height='32'>".'","cod_cita":"-"}]';
return;
}
$rs=citas_paciente($documento);

if($rs["ERROR"]=='0'){
    $data=$rs["RESPUESTA"];              
    
    $xml = simplexml_load_string($data);
    $json = json_encode($xml);
    $array = json_decode($json,TRUE);       
    $citas = $array['row'];        
    $x=str_replace($buscar2,$reemplazar2,json_encode($citas));
    
    $posicion_coincidencia = strpos($x, '[');
    
    if ($posicion_coincidencia === false) {
        echo "[$x]";   
    } else {
        echo $x;   
    }    
} else {
    print_r($rs);
}

