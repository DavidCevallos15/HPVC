<?php


require_once 'nusoap-0.9.5/lib/nusoap.php';     

$url_webservice="http://172.16.20.83/ws_syshpvc/index.php?wsdl";



function obj2array($obj) {
    $out = array();
    foreach ($obj as $key => $val) {
      switch (true) {
        case is_object($val):
          $out[$key] = obj2array($val);
          break;
        case is_array($val):
          $out[$key] = obj2array($val);
          break;
        default:
          $out[$key] = $val;
      }
    }
    return $out;
  }


 function citas_paciente($cedula){
    global $url_webservice;
    //$cliente = new nusoap_client($url_webservice);
    $cliente=new nusoap_client($url_webservice,false,false,false,false,false,15,15);
    
    $cliente->decode_utf8 = false;
    $err = $cliente->getError();
    
    if ($err) {	return array("ERROR"=>$err,"RESPUESTA"=>"");  }

    $datos_consulta = array( "valor" =>  $cedula);
    $resultado = $cliente->call('api_0004_SYS_HPVC',$datos_consulta);

    if ($cliente->fault) {
            //echo 'Fallo';
            return array("ERROR"=>"1","RESPUESTA"=>$resultado);
    } else {	// Chequea errores
            $err = $cliente->getError();
            if ($err) {		// Muestra el error
                   // echo 'Error' . $err ;
                    return array("ERROR"=>"2","RESPUESTA"=>$err);
                    
            } else {		// Muestra el resultado
                   // echo 'Resultado';
                    return array("ERROR" =>"0","RESPUESTA"=>$resultado);
            }
    }
}
function cita_paciente_pdf($id){
    global $url_webservice;
    //$cliente = new nusoap_client($url_webservice);
    $cliente=new nusoap_client($url_webservice,false,false,false,false,false,15,15);
    
    $cliente->decode_utf8 = false;
    $err = $cliente->getError();
    
    if ($err) {	return array("ERROR"=>$err,"RESPUESTA"=>"");  }

    $datos_consulta = array( "valor" =>  $id);
    $resultado = $cliente->call('api_0005_SYS_HPVC',$datos_consulta);

    if ($cliente->fault) {
            //echo 'Fallo';
            return array("ERROR"=>"1","RESPUESTA"=>$resultado);
    } else {	// Chequea errores
            $err = $cliente->getError();
            if ($err) {		// Muestra el error
                   // echo 'Error' . $err ;
                    return array("ERROR"=>"2","RESPUESTA"=>$err);
                    
            } else {		// Muestra el resultado
                   // echo 'Resultado';
                    return array("ERROR" =>"0","RESPUESTA"=>$resultado);
            }
    }
}  
function datos_paciente_x_cedula($cedula){
    global $url_webservice;
    //$cliente = new nusoap_client($url_webservice);
    $cliente=new nusoap_client($url_webservice,false,false,false,false,false,15,15);
    $err = $cliente->getError();
    
    if ($err) {	return array("ERROR"=>$err,"RESPUESTA"=>"");  }

    $datos_consulta = array( "cedula" =>  $cedula);
    $resultado = $cliente->call('obtenerDatosDePacientePorNumeroDeCedula',$datos_consulta);

    if ($cliente->fault) {
            //echo 'Fallo';
            return array("ERROR"=>$resultado,"RESPUESTA"=>"");
    } else {	// Chequea errores
            $err = $cliente->getError();
            if ($err) {		// Muestra el error
                   // echo 'Error' . $err ;
                    return array("ERROR"=>$err,"RESPUESTA"=>"");
                    
            } else {		// Muestra el resultado
                   // echo 'Resultado';
                    return array("ERROR" =>"0","RESPUESTA"=>$resultado);
            }
    }
}

  
/* function datos_paciente_x_cedula
  Array ( 
 * [CalleDomicilio] => 3ERA ETAPA 
 * [Cedula] => 1311972440 
 * [CodigoError] => 000 
 * [CondicionCedulado] => CIUDADANO 
 * [Conyuge] => SANCHEZ ULQUIANGO MARIA FERNANDA 
 * [Domicilio] => MANABI/PORTOVIEJO/12 DE MARZO 
 * [Error] => NO ERROR 
 * [EstadoCivil] => CASADO 
 * [FechaCedulacion] => 21/09/2012 
 * [FechaNacimiento] => 18/06/1985 
 * [FirmaElectronica] => CAMPO POR EL MOMENTO NO DISPONIBLE 
 * [Genero] => MASCULINO 
 * [IndividualDactilar] => V3344I4244 
 * [Instruccion] => SUPERIOR 
 * [LugarNacimiento] => MANABI/TOSAGUA/TOSAGUA 
 * [Nacionalidad] => ECUATORIANA 
 * [NombreMadre] => SUBIAGA MOREIRA YOLANDA MARLENE 
 * [NombrePadre] => ARTEAGA ALCIVAR JOSE WAGNER 
 * [Nombre] => ARTEAGA SUBIAGA JOSE DANIEL 
 * [NumeroDomicilio] => 
 * [Profesion] => ING. SIST/INFO/COMPUT 
 * ) 
 */

function datos_paciente_x_nombres_y_edad($apellido1,$apellido2,$nombre1,$nombre2,$edadinicio,$edadfinal){
    global $url_webservice;
    $cliente = new nusoap_client($url_webservice);
    $err = $cliente->getError();
    
    if ($err) {	return array("ERROR"=>$err,"RESPUESTA"=>"");  }

    $datos_consulta = array( "apellido1" =>$apellido1,"apellido2" =>$apellido2,"nombre1" =>$nombre1,"nombre2" =>$nombre2,"edadinicio" =>$edadinicio,"edadfinal" =>$edadfinal);
    $resultado = $cliente->call('obtenerDatosDePacientePorNombresYEdadDeReferencia',$datos_consulta);

    if ($cliente->fault) {
            //echo 'Fallo';
            return array("ERROR"=>$resultado,"RESPUESTA"=>"");
    } else {	// Chequea errores
            $err = $cliente->getError();
            if ($err) {		// Muestra el error
                   // echo 'Error' . $err ;
                    return array("ERROR"=>$err,"RESPUESTA"=>"");
                    
            } else {		// Muestra el resultado
                   // echo 'Resultado';
                    return array("ERROR" =>"0","RESPUESTA"=>$resultado);
            }
    }
}




function foto_paciente_x_cedula($cedula){
    global $url_webservice;
    //$cliente = new nusoap_client($url_webservice);
    $cliente=new nusoap_client($url_webservice,false,false,false,false,false,15,15);
    $err = $cliente->getError();
    
    if ($err) {	return array("ERROR"=>$err,"RESPUESTA"=>"");  }

    $datos_consulta = array( "cedula" =>  $cedula);
    $resultado = $cliente->call('api_001',$datos_consulta);

    if ($cliente->fault) {
            //echo 'Fallo';
            return array("ERROR"=>$resultado,"RESPUESTA"=>"");
    } else {	// Chequea errores
            $err = $cliente->getError();
            if ($err) {		// Muestra el error
                   // echo 'Error' . $err ;
                    return array("ERROR"=>$err,"RESPUESTA"=>"");
                    
            } else {		// Muestra el resultado
                   // echo 'Resultado';
                    return array("ERROR" =>"0","RESPUESTA"=>$resultado);
            }
    }
}
function seguro_paciente_x_cedula($cedula,$fecha_covertura){
    global $url_webservice;
    //$cliente = new nusoap_client($url_webservice);
    $cliente=new nusoap_client($url_webservice,false,false,false,false,false,15,15);
    $err = $cliente->getError();
    
    if ($err) {	return array("ERROR"=>$err,"RESPUESTA"=>"");  }

    $datos_consulta = array( "documento" =>  $cedula,"fecha_covertura" =>$fecha_covertura);
    $resultado = $cliente->call('api_002',$datos_consulta);

    if ($cliente->fault) {
            //echo 'Fallo';
            return array("ERROR"=>$resultado,"RESPUESTA"=>"");
    } else {	// Chequea errores
            $err = $cliente->getError();
            if ($err) {		// Muestra el error
                   // echo 'Error' . $err ;
                    return array("ERROR"=>$err,"RESPUESTA"=>"");
                    
            } else {		// Muestra el resultado
                   // echo 'Resultado';
                    return array("ERROR" =>"0","RESPUESTA"=>$resultado);
            }
    }
}