
<?php
//error_reporting(E_ALL);
//ini_set('display_errors', '1');
 
//cargamos los datos depediendo la modalidad del estudiante
header( 'Content-type: text/html; charset=iso-8859-1');
//date_default_timezone_set("America/Guayaquil");

ob_start();
$buscar=array(chr(13).chr(10), "\r\n", "\n", "\r","<BR>","INSERT INTO","DELETE","UPDATE",",","'");
$reemplazar=array("", "", "", "", "-","-", "-","-","-","");

$subcarpetapdf = "tmp/pdf/";
$subcarpetaqr  = "tmp/qr/";
$id=trim(str_ireplace($buscar,$reemplazar,strtoupper ($_POST["id"])));//1350342455
$modulo        = "CONSULTA_CITA";



$content =ob_get_clean();
include_once('cls/buscar_ws.php');
require_once('cls/phpqrcode/qrlib.php');
include("cls/mpdf60/mpdf.php");




function f_generar_codigo_qr ($modulo, $textQR,$subcarpetaqr){
    
    global $cedula;

    //CODIGO QR

    $PNG_TEMP_DIR = $_SERVER['DOCUMENT_ROOT'].'/consulta_cita/'.$subcarpetaqr;
    $PNG_WEB_DIR  = $_SERVER['DOCUMENT_ROOT'].'/consulta_cita/'.$subcarpetaqr;
    
    //ofcourse we need rights to create temp dir
    if (!file_exists($PNG_TEMP_DIR)) {mkdir($PNG_TEMP_DIR);}

    $errorCorrectionLevel = 'L';
    $matrixPointSize      = 4; 
    $fecha                = time();
    $filename = $PNG_TEMP_DIR.'QR_HPVC_'.$modulo."_".$cedula."_".date("Ymd")."_".date("His",$fecha).'.png';
     
    //$textQR=Encrypter::encrypt($textQR);
    QRcode::png($textQR, $filename, $errorCorrectionLevel, $matrixPointSize, 2);
    return $PNG_WEB_DIR.basename($filename);    
}
$dias = array("Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sábado");
$meses = array("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
 




//$mpdf=new mPDF('s');

///agregado //'','','','', 15,15,15,15,9,  9,'l' 
//--------------- ($mode,$format,default_font_size,default_font,margin_left,$margin_right,$margin_top,$margin_bottom,$margin_header,$margin_footer,$orientation)
$mpdf=new mPDF('c','A4','','',15,10,30,15,6,12); 
$mpdf->SetImportUse();	
//$mpdf->SetDocTemplate('../../img/fondos_pagina/fondo_vertical.pdf', 1);	// 1|0 to continue after end of document or not - used on matching page numbers

$mpdf->mirrorMargins = 0;	// Utilice diferentes pares / impares encabezados y pies de página y márgenes simétricos
//$mpdf->defaultheaderfontsize = 10;	/* in pts */
//$mpdf->defaultheaderfontstyle = B;	/* blank, B, I, or BI */
//$mpdf->defaultheaderline = 0; 	/* 1 to include line below header/above footer */
//Encabezado----------------------------
//$ruta_escudo   = $_SERVER['DOCUMENT_ROOT'].'/'.Security::getRaiz_Aplicacion().'/img/utm.jpg';



$destino_temp = $subcarpetapdf;


$body='<link href="css/estilo_reportes.css" rel="stylesheet" type="text/css"/>
<style type="text/css">
    <!--
    .Estilo1 {
            font-size: 36px;
            font-weight: bold;
    }
    .Estilo2 {
            font-size: 18px;
            font-weight: bold;
    }
    -->
</style>';
$rs=cita_paciente_pdf($id);


 if($rs["ERROR"]=='0'){
    //$row=$rs["RESPUESTA"];
    $xml = simplexml_load_string($rs["RESPUESTA"]);
    $json = json_encode($xml);
    $array = json_decode($json,TRUE);
    $row = $array['row'];
    //$array['row']
   //echo $row;
    //print_r($row);
    $hora_cita=$row['hora_cita'];//($row['hora_cita']='23:59'?'TURNO EXTRA':$row['hora_cita']);
         $datos_qr=$row['numero_cita']."$$".$row['cod1']."$$".$row['cod2']."$$".$row['fecha_res']."$$".$row['documento_paci']."$$".$row['autorizacion']."$$".$row['fecha_cita']."$$".$hora_cita."$$".$row['cod_medi']."$$".$row['nom_res'];
         $HeaderHtml = '    
                <table  border="0" class="tablas_encabezado_informacion">
                  <tr>
                    <th width="120" rowspan="4" scope="col" class="imagenescudo"><img WIDTH=120 HEIGHT=50 src="img/logo_oficial_del_hospital2.jpg" alt=""/></th>
                    <th width="486" scope="col" class="tituloutm" >MINISTERIO DE SALUD PUBLICA DEL ECUADOR</th>
                    <th width="172" colspan="2" rowspan="4" class="tablas_encabezado_informacion_celda_sin_bordes_codigoqr" scope="col">
                     <div class="imagencodigoqr">
                      <img width="120px" height="100px" align="middle" alt="Codigo QR" src="'.f_generar_codigo_qr($modulo, $datos_qr,$subcarpetaqr).'" />
                     </div>
                    </th>
                  </tr>  
                  <tr>
                    <td class="subtituloutm" >1360008370001</td>
                  </tr>
                  <tr>
                    <td class="subtituloutm">TEL: 052590140 </td>
                  </tr>
                  <tr>
                    <td class="subtituloutm">CITA MEDICA</td>
                  </tr>
                </table>';
         $fecha_cita=$dias[date('w',strtotime($row['fecha_cita']))]." ".date('d',strtotime($row['fecha_cita']))." de ".$meses[date('n',strtotime($row['fecha_cita']))-1]. " del ".date('Y',strtotime($row['fecha_cita']));
         $body.='
                <table width="793" border="0" class="tablas_notas">
                  <tr>
                    <th width="85" rowspan="2" scope="col" class="tablas_notas_celda_titulo">NUMERO :</th>
                    <th width="66" rowspan="2" scope="col" class="tablas_notas_celda_filas2">'.$row['numero_cita'].'</th>
                    <th width="184" scope="col" class="tablas_notas_celda_filas2">'.($row['cod1']).'</th>
                    <th width="180" rowspan="2" scope="col" class="tablas_notas_celda_titulo">RESERVADA :</th>
                    <th width="244" rowspan="2" scope="col" class="tablas_notas_celda_filas2">'.($row['fecha_res']).' <-> '.$row['nom_res'].'</th>
                  </tr>
                  <tr>
                    <th scope="col" class="tablas_notas_celda_filas2">'.($row['cod2']).'</th>
                  </tr>
                </table>

                <table width="791" border="0" class="tablas_notas">
                  <tr>
                    <th scope="col" class="tablas_notas_celda_titulo">Paciente:</th>
                    <th scope="col" class="tablas_notas_celda_filas2">'.($row['documento_paci']).'</th>
                    <th colspan="6" scope="col" class="tablas_notas_celda_filas2">'.($row['nom_paci']).'</th>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">Nacimiento:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['fecha_naci']).'</td>
                    <td class="tablas_notas_celda_titulo">Edad:</td>
                    <td colspan="3" class="tablas_notas_celda_filas2">'.($row['anios']).' A&Ntilde;OS, '.($row['meses']).' Meses, '.($row['dias']).' dias</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">Sexo:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['sexo']).'</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">Direcci&oacute;n:</td>
                    <td colspan="5" class="tablas_notas_celda_filas2">'.($row['direccion']).'</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">Tel&eacute;fono:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['telef']).'</td>
                    <td class="tablas_notas_celda_titulo">Celular:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['telef2']).'</td>
                    <td class="tablas_notas_celda_titulo">Tel Oficina:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['telef3']).'</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">Contrato:</td>
                    <td colspan="5" class="tablas_notas_celda_filas2">'.($row['contrato']).'</td>
                    <td class="tablas_notas_celda_titulo">Autorizaci&oacute;n:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['autorizacion']).'</td>
                  </tr>
                </table>

                <table width="791" border="0" class="tablas_notas">
                  <tr>
                    <th width="115" scope="col" class="tablas_notas_celda_titulo">FECHA CITA:</th>
                    <th width="341" scope="col" class="tablas_notas_celda_filas2">'.$fecha_cita.'</th>
                    <th width="80" scope="col" class="tablas_notas_celda_titulo">HORA:</th>
                    <th width="106" scope="col" class="tablas_notas_celda_filas2">'.($hora_cita).'</th>
                    <th width="87" scope="col" class="tablas_notas_celda_titulo">DURACI&Oacute;N</th>
                    <th width="22" scope="col" class="tablas_notas_celda_filas2">'.($row['duracion']).' M </th>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">SEDE:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['sede']).'</td>
                    <td class="tablas_notas_celda_titulo">BARRIO:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['barrio']).'</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">CIUDAD:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['ciudad']).'</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="tablas_notas_celda_titulo">CONSULTORIO:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['consultorio']).'</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td class="tablas_notas_celda_titulo">VALOR:</td>
                    <td class="tablas_notas_celda_filas2">'.($row['valor']).'</td>
                  </tr>
                </table>

                <table width="792" border="0" class="tablas_notas">
                  <tr>
                    <th width="133" class="tablas_notas_celda_titulo" scope="col">MEDICO(S):</th>
                    <th width="73" class="tablas_notas_celda_titulo" scope="col">'.$row['cod_medi'].'</th>
                    <th width="365" class="tablas_notas_celda_titulo" scope="col">'.$row['nom_medi'].'</th>
                    <th colspan="2" class="tablas_notas_celda_titulo" scope="col">'.($row['especialidad']).'</th>
                  </tr>
                  <tr>
                    <td colspan="5" class="tablas_notas_celda_filas2">'.($row['mensaje']).'</td>
                  </tr>
                  <tr>
                    <td colspan="3" >&nbsp;</td>
                    <td width="100" class="tablas_notas_celda_titulo">Fecha impresión: </td>
                    <td width="107" class="tablas_notas_celda_filas2">'.date("d/m/Y H:i:s").'</td>
                  </tr>
                </table>
<table width="1117" border="0">
  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td colspan="2"><span class="Estilo1">REQUISITOS</span></td>
  </tr>
  <tr>
    <td colspan="2">&nbsp;</td>
  </tr>
  <tr>
    <td width="625"><span class="Estilo2">SEGURO GENERAL :</span></td>
    <td width="476"><span class="Estilo2">SEGURO ISSPOL:</span></td>
  </tr>
  <tr>
    <td>*CEDULA DEL TITULAR</td>
    <td><strong>TITULAR</strong></td>
  </tr>
  <tr>
    <td>*APORTACIONES ( 6 ULTIMAS )</td>
    <td>*C&Eacute;DULA DEL PACIENTE (ASEGURADO)</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>*CREDENCIAL DE LA POLICIA (PACIENTE)</td>
  </tr>
  <tr>
    <td><strong>SI ES ATENCI&Oacute;N M&Eacute;DICA DE UN HIJO NECESITA:</strong></td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>*C&Eacute;DULA DE PAPA O MAMA</td>
    <td><strong>HIJO O ESPOSA</strong></td>
  </tr>
  <tr>
    <td>*C&Eacute;DULA DEL HIJO</td>
    <td>*C&Eacute;DULA DEL HIJO O ESPOSA Y CREDENCIAL</td>
  </tr>
  <tr>
    <td>*APORTACIONES (6 ULTIMAS)</td>
    <td>*C&Eacute;DULA DEL TITULAR Y CREDENCIAL</td>
  </tr>
  <tr>
    <td><strong>NOTA:</strong>A PARTIR DEL TERCER MES DE APORTACI&Oacute;N PUEDE HACER USO DEL SEGURO.</td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td><span class="Estilo2">SEGURO ISSFA:</span></td>
  </tr>
  <tr>
    <td><span class="Estilo2">SEGURO CAMPESINO:</span></td>
    <td><strong>TITULAR</strong></td>
  </tr>
  <tr>
    <td>*CEDULA DEL JEFE DE FAMILIA</td>
    <td>*C&Eacute;DULA DEL PACIENTE (ASEGURADO)</td>
  </tr>
  <tr>
    <td>*CARNET DE AFILIACI&Oacute;N</td>
    <td>*CREDENCIAL  (PACIENTE)</td>
  </tr>
  <tr>
    <td>*CERTIFICADO DE PAGO (ULTIMO)</td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>*VERIFICAR EN EL SISTEMA DE COBERTURA SI CUENTAN CON SEGURO.</td>
    <td><strong>HIJO O ESPOSA</strong></td>
  </tr>
  <tr>
    <td><strong>NOTA:</strong>LOS HIJOS MENORES DE 1 A&Ntilde;O PUEDEN HACER USO DEL SEGURO CAMPESINO SIEMPRE Y CUANDO LOS PAPAS SEAN JEFE DE FAMILIA, PASADOS DE UN 1 A&Ntilde;O TENDR&Aacute;N QUE AGREGAR A SUS HIJOS COMO CARGA EN EL SEGURO CAMPESINO.</td>
    <td>*CEDULA DEL HIJO O ESPOSA Y CREDENCIAL</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>*CEDULA DEL TITULAR Y CREDENCIAL</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
</table>
                ';
     
 }


                                    
//O - establecer el encabezado de las páginas impares
//E - establecer el encabezado para páginas pares
//BLANK - establece encabezados ODD
$mpdf->SetHTMLHeader($HeaderHtml, ''); 


$mpdf->defaultfooterfontsize = 8;	/* in pts */
$mpdf->defaultfooterfontstyle = BI;	/* blank, B, I, or BI */
$mpdf->defaultfooterline = 0; 	/* 1 to include line below header/above footer */
$mpdf->SetDisplayMode('fullpage');
/*
zoom:	    	fullpage: displays the entire page on screen
                fullwidth: uses maximum width of windows
                real: uses real size (equivalent 100% zoom)
                default: uses viewer default mode
layout:	    	singlepage: displays pages one by one
                continuous: displays pages continuously
                two: displays 2 pages on 2 columns
                default: uses viewer default mode
*/
//$mpdf->SetHeader('REPORTE GENERADO EL: '.$fecha.' '.$hora_f.'||INFORME DE CALIFICACIONES');
$mpdf->SetFooter('|Sistema de Información Hospitalaria SYSHPVC {PAGENO} de {nb}|','O');	/* defines footer for Odd and Even Pages - placed at Outer margin */
$mpdf->ignore_invalid_utf8 = true;
//echo $body;
//return;
//$mpdf->AddPage('L');
$mpdf->WriteHTML($body);
$mpdf->RestartDocTemplate();

$fecha      = time();




$nombre = 'RP_SYSHPVC_'.$modulo.'_'.$cedula."_".date("Ymd")."_".date("His",$fecha).".pdf";

if (!file_exists($destino_temp)) {mkdir($destino_temp);}

$mpdf->Output($destino_temp.$nombre,"F");


//echo $destino_temp;
if(file_exists($destino_temp.$nombre)){ 

	?>
        <iframe  name="iframe_report" id="iframe_report" src="<?php echo $subcarpetapdf.$nombre; ?>" width="100%" height="98%" style="border:none;"  /> 
        <?php 
}else{echo "No se genero el archivo, intente luego.";}

?>


