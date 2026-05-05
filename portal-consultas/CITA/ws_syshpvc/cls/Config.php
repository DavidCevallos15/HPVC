<?php
//return;
include_once 'Security/Security.php';


$_SESSION["server_pg"]  ="172.16.20.80";

$_SESSION["base_pg"]    ="db_hpvc";
$_SESSION["user_pg"]    ="postgres";
$_SESSION["clav_pg"]    ="ticsmanager2019+";

include_once 'Base.php';


//$db_PG->LogSQL();

$name_server="";

function getInformation(){ 	//Primero obtenemos la ip
	if ($_SERVER) {  
	if ( $_SERVER["HTTP_X_FORWARDED_FOR"] ) {  
       $ip = $_SERVER["HTTP_X_FORWARDED_FOR"];  
   } elseif ( $_SERVER["HTTP_CLIENT_IP"] ) {  
       $ip = $_SERVER["HTTP_CLIENT_IP"];  
   } else {  
       $ip = $_SERVER["REMOTE_ADDR"];  
   }  
} else {  
    if ( getenv( 'HTTP_X_FORWARDED_FOR' ) ) {  
       $ip = getenv( 'HTTP_X_FORWARDED_FOR' );  
    } elseif ( getenv( 'HTTP_CLIENT_IP' ) ) {  
       $ip = getenv( 'HTTP_CLIENT_IP' );  
    } else {  
       $ip = getenv( 'REMOTE_ADDR' );  
    }  
}
    
	//La variable información contendra los datos que trae la cabecera
	// 'HTTP_USER_AGENT', como lo son navegador y su versión, ademas del 
	//sistema operativo
    $informacion = $_SERVER['HTTP_USER_AGENT']; 
    //Si no se encuentran coincidencias se mostraran los valores
	//de las variables que estan puestos por defecto (los que siguen)
	$navegador = 'Desconocido';
	$version= "";
    $SO = 'Desconocido';
	//Obtenemos el puerto por el cual el cliente esta conectado a nuestro servidor
	$puerto = $_SERVER['REMOTE_PORT'];
    
    /* Ahora averiguamos el nombre del navegador*/
	//Lo que hacemos es comparar los nombres de los navegadores
	//con la información de la cabecera HTTP_USER_AGENT, y cuando haya una
	//coincidencia guardar la variable.
    if(preg_match('/MSIE/i',$informacion) && !preg_match('/Opera/i',$informacion)) 
    { 
        $navegador = 'Internet Explorer'; 
        $n_navegador = "MSIE"; 
    } 
    elseif(preg_match('/Firefox/i',$informacion)) 
    { 
        $navegador = 'Mozilla Firefox'; 
        $n_navegador = "Firefox"; 
    } 
    elseif(preg_match('/Chrome/i',$informacion)) 
    { 
        $navegador = 'Google Chrome'; 
        $n_navegador = "Chrome"; 
    } 
    elseif(preg_match('/Safari/i',$informacion)) 
    { 
        $navegador = 'Apple Safari'; 
        $n_navegador = "Safari"; 
    } 
    elseif(preg_match('/Opera/i',$informacion)) 
    { 
        $navegador = 'Opera'; 
        $n_navegador = "Opera"; 
    } 
    elseif(preg_match('/Netscape/i',$informacion)) 
    { 
        $navegador = 'Netscape'; 
        $n_navegador = "Netscape"; 
    } 
    
    // Finalmente obtenemos la versión del navegador
	//Esto es una expresión regular que no explicare...apenas y la entiendo yo
	$patron = '#(?<browser>' . $n_navegador .')[/ ]+(?<version>[0-9.|a-zA-Z.]*)#';
    if (!preg_match_all($patron, $informacion, $busqueda)) {
        // aun no tenemos el número correcto, solo continuamos
    }
    
    // Contamos cuantos números tenemos de la versión
    $i = count($busqueda['browser']);
    if ($i != 1) {
		//comprobamos en que posición del array esta la versión
        if (strripos($informacion,"version") < strripos($informacion,$n_navegador)){
            $version= $busqueda['version'][0];
        }
        else {
            $version= $busqueda['version'][1];
        }
    }
    else {
        $version= $busqueda['version'][0];
    }
    
    // Comprobamos si tenemos un número
    if ($version==null || $version=="") {
	$version="???";
	}
	
	//Obtenemos el sistema operativo
    if (preg_match('/linux/i', $informacion)) {
        $SO = 'linux';
    }
    elseif (preg_match('/macintosh|mac os x/i', $informacion)) {
        $SO = 'mac';
    }
    elseif (preg_match('/windows|win32/i', $informacion)) {
        $SO = 'Windows';
    }
    //Asignamos un valor a cada variable dentro del array
    return array(
	'dirección' => $ip,
        'navegador' => $navegador,
        'version'   => $version,
        'SO'  	    => $SO,
	'puerto'    => $puerto
    );
} 

function getRealIP() {
	if (!empty($_SERVER['HTTP_CLIENT_IP']))
		return $_SERVER['HTTP_CLIENT_IP'];
	   
	if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
		return $_SERVER['HTTP_X_FORWARDED_FOR'];
   
	return $_SERVER['REMOTE_ADDR'];
}

function f_mensaje_sistema($titulo = 'Error!',$texto = 'No definido'){
    $texto = str_replace('"', "",$texto);
    $result_html = '<script>
                    dhtmlx.alert({
                        title: "'.$titulo.'",
                        ok   : "Aceptar",
                        type : "alert-error",
                        text : "'.$texto.'"
                    });
                    </script>';
    return $result_html;
}

function f_cargar_opciones($p_idpersonal = 0,$p_idtipo_usuario = 0) {
    global $db_PG;
    if ($p_idpersonal == 0 or $p_idtipo_usuario == 0) { return -1; }
    $sql = "SELECT 
            m.idmenu,
            idmenu_padre,
            idnivel_seguridad,
            nombre,
            abrevia,
            ruta,
            mp.fecha,
            orden,
            btn_tipo,
            case btn_isbig when 'true' then '48' || btn_img else '18' || btn_img end as btn_img,
            case btn_isbig when 'true' then '48' || btn_imgdis else '18' || btn_imgdis end as btn_imgdis,
            btn_isbig,
            btn_disable,
            nivel_opcion,
            tab,
            tab_active
          FROM  esq_usuarios.menu m inner join esq_usuarios.menu_personal mp on m.idmenu = mp.idmenu
          where mp.habilitado = 'S' and mp.idpersonal = $p_idpersonal and mp.idtipousuario = $p_idtipo_usuario
          order by m.orden;";
    $rs  = $db_PG->Execute($sql); 
    //$stmt = $db_PG->PrepareSP($sql);
    //$rs   = $db_PG->Execute($stmt, array($p_idpersonal,$p_idtipo_usuario)); 
    if($db_PG->ErrorMsg()!=""){ echo f_mensaje_sistema('Error!',str_replace("'", "-", str_replace("ERROR:", "",$db_PG->ErrorMsg()))); return; }
    $i=0;
    foreach($rs as $k => $row) {  
        $MiArray[$row['idmenu']] = array(   $row['idmenu'],     $row['idmenu_padre'], $row['idnivel_seguridad'],$row['nombre'],         $row['abrevia'], 
                                            $row['ruta'],       $row['fecha'],        $row['orden'],            $row['btn_tipo'],       $row['btn_img'], 
                                            $row['btn_imgdis'], $row['btn_isbig'],    $row['btn_disable'],      $row['nivel_opcion'],   $row['tab'],
                                            $row['tab_active']); 
        $i++;
    }
    if ($i == 0) {$MiArray = null;}
    return $MiArray;
}

function f_dibuja_opciones($parent, $array) {
    $has_children = false;
    $coma_button = '';
    $coma_block  = '';
    $coma_tab    = '';
    if(count($array)<= 0) {return;}
    foreach($array as $key => $value) {
        $idmenu             = $value[0];
        $idmenu_padre       = $value[1];
        $idnivel_seguridad  = $value[2];
        $nombre             = utf8_encode($value[3]);
        $abrevia            = ucwords(strtolower(utf8_encode($value[4])));
        $folder_ruta        = $value[5];
        $fecha              = $value[6];
        $orden              = $value[7];
        $btn_tipo           = $value[8];
        $btn_img            = $value[9];
        $btn_imgdis         = $value[10];
        $btn_isbig          = $value[11];
        $btn_disable        = $value[12];
        $nivel_opcion       = $value[13];
        $tab                = $value[14];
        $tab_active         = $value[15];
        
        //$abrevia = $nombre;
        
        $archivo_php        = "index";
        $Ruta               = "";
        if ($idmenu_padre != 0 && $nivel_opcion == 3) {
                $Ruta = "click_opcion({
                                        pos:    -1,
                                        id:     '$idmenu',
                                        titulo: '$nombre',
                                        ruta:   '$folder_ruta',
                                        vista:  '$archivo_php',
                                        code:   '$idmenu',
                                        idop:   '$tab'});"; //.'|'.$id_menu		
        }
        if ($idmenu_padre == $parent) {
            //echo "-->$has_children<br/>$parent<br/><br/>";
            if ($has_children === false && $parent) {
                
                $has_children = true;
                //echo '<ul id="'.$IdMenu.'">' ."\n";
            } 
            switch($nivel_opcion){
                case 1: //tab
                    echo "$coma_tab\n{id: '$tab', text: '$nombre', active: $tab_active, items: ["."\n";
                    $coma_block  = '';
                    $coma_tab    = ', ';
                    break;
                case 2: //grupo
                    echo "$coma_block\n{type: 'block', text: '$abrevia', mode: 'cols', list: ["."\n";
                    $coma_button = '';
                    $coma_block  = ', ';
                    break;
                case 3:
                    echo "$coma_button\n{ id:'$idmenu', type: '$btn_tipo', text: '$abrevia', isbig: $btn_isbig, img: '$btn_img', imgdis: '$btn_imgdis', disable:$btn_disable , onclick: function(id) { $Ruta } }". "\n";
                    $coma_button = ', ';
                    break;
            }            

            
            //echo '<li id="'.$IdMenu.'"><a href="javascript:void(0)" '.$Ruta.' >'.utf8_encode($NombreMenu).'</a>' . "\n";
            f_dibuja_opciones($key, $array);
            if($nivel_opcion !=3){ echo "]}"."\n";} //echo "</li>\n";
        }
    }
    //if ($has_children === true && $parent&&$nivel_opcion !=3) { echo "]}X$idmenu"."\n"; /* echo "</ul>\n";*/ }
} 






function Secure($Campo){
    $buscar_min = array("'", " insert ", " delete ", " update ", " select "," into ");
    $reemplazar = array(" ", " ", " ", " ", " "," ");
    if (trim($Campo)!= "") {
        return str_ireplace($buscar_min,$reemplazar, $Campo);
    }
}

function f_crypt_appdvmdc($cadena,$clave = 'syshpvc') {
	global $core;
	$resultado ='';
	for($i=0; $i<strlen($cadena); $i++) {
		$char = substr($cadena, $i, 1);
		$keychar = substr($clave, ($i % strlen($clave))-1, 1);
		$char = chr(ord($char)+ord($keychar));
		$resultado.=$char;
	}
	return str_replace(array('+', '/', '='), array('-', '_', ''), base64_encode($resultado));
}

function f_descrypt_appdvmdc($cadena,$clave = 'syshpvc') {
	global $core;
	$resultado = '';
	$cadena = base64_decode($cadena);
	$cadena = str_replace(array('-', '_'), array('+', '/'), $cadena);
	for($i=0; $i<strlen($cadena); $i++) {
		$char = substr($cadena, $i, 1);
		$keychar = substr($clave, ($i % strlen($clave))-1, 1);
		$char = chr(ord($char)-ord($keychar));
		$resultado.=$char;
	}
	return $resultado;
}


