<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

include_once('cls/Config.php');
include_once('cls/nusoap-0.9.5/lib/nusoap.php');
  


$buscar=array(chr(13).chr(10), "\r\n", "\n", "\r","<BR>","INSERT INTO","DELETE","UPDATE","DROP","/","<",">");
$reemplazar=array("", "", "", "", "-","-", "-","-","-","-","-","-");

function clear_text($t,$modo){
    $texto="";
    global $buscar;
    global $reemplazar;
    
    if($modo==1){
    $texto=(trim(str_ireplace($buscar,$reemplazar,strtoupper ($t)))==""?'null':trim(str_ireplace($buscar,$reemplazar,strtoupper ($t))));
    }else{
       $texto=(trim(str_ireplace($buscar,$reemplazar,strtoupper ($t)))==''?'null':"'".trim(str_ireplace($buscar,$reemplazar,strtoupper ($t)))."'");
    }
    return $texto;
}

function doAuthenticate() {
    conexion_pg('DB_HPVC');
    global $db_PG;
    $result=false;
    $sql="";
    if (isset($_SERVER['PHP_AUTH_USER']) and isset($_SERVER['PHP_AUTH_PW'])) {
        $usu=clear_text($_SERVER['PHP_AUTH_USER'],2);
        $pas=clear_text($_SERVER['PHP_AUTH_PW'],2);
        $sql="SELECT 
                count(
                uw.id_user
                )
              FROM 
                esq_ws.user_ws uw
              where uw.estado='A' and uw.usuario=$usu and uw.clave=$pas;";
        if ($rs = $db_PG->Execute($sql)){
            if($rs->fields[0]>0){
                //return true;
                $result=true;
            }else{
                //return false;
                $result=false;
                 //throw new SoapFault("Error ", 'El usuario no existe.');
            }
        }       
        
    }
    //else{
    //    return true;
    //} 
    $db_PG->Close();
    return $result;
}

function arrayToXml($array, &$xml){
    foreach ($array as $key => $value) {
        if(is_array($value)){
            if(is_int($key)){
                $key = "e";
            }
            $label = $xml->addChild($key);
            $this->arrayToXml($value, $label);
        }
        else {
            $xml->addChild($key, $value);
        }
    }
}

function api_0001($valor){//muestraProfesional
    conexion_pg('DB_HOSVITALC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT 
    trim(md.mmcodm) as cod_med,
    trim(md.mnom1) as nombre1,
    trim(md.mnom2) as nombre2,
    trim(md.mape1) as apellido1,
    trim(md.mape2) as apellido2,
    trim(md.mmregm) as cod_msp,
    trim(md.mtipdoc) as tipo_docu,
    trim(md.mmcedm) as cedula,
    trim(md.mmtelm) as telefono,
    esp.mecode as cod_espe,
    trim(esp.menome) as especialidad


  FROM 
  maemed1 md
  INNER JOIN maemed md_esp
  on md_esp.mmcodm=md.mmcodm
  inner join maeesp esp
  on esp.mecode = md_esp.mecode
  where md.mmestado='A' and (md.mmcedm like '%$id%' or COALESCE(md.mape1,'') || COALESCE(md.mape2,'') || COALESCE(md.mnom1,'') || COALESCE(md.mnom2,'') like upper('%$id%') )
    and esp.espatncex='S' and esp.menome not like '%ENFERMER%' and esp.menome not like '%AUXILI%' and esp.menome not like '%TRABAJO SOCIAL%' and esp.menome not like '%TRABAJO SOCIAL%';";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='".$row['0']."'>
                    <cod_med>".$row['0']."</cod_med>
                    <nombre1>".$row['1']."</nombre1>
                    <nombre2>".$row['2']."</nombre2>
                    <apellido1>".$row['3']."</apellido1>
                    <apellido2>".$row['4']."</apellido2>
                    <cod_msp>".$row['5']."</cod_msp>
                    <tipo_docu>".$row['6']."</tipo_docu>
                    <cedula>".$row['7']."</cedula>
                    <telefono>".$row['8']."</telefono>
                    <cod_espe>".$row['9']."</cod_espe>
                    <especialidad>".$row['10']."</especialidad>
                    </row>";
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

function api_0002($valor){//muestraPacientes
    conexion_pg('DB_HOSVITALC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT 
            trim(paciente.mpcedu) as cedula_pac,
            trim(paciente.mptdoc) as tipo_doc_pac,
            trim(paciente.mpape1) as apellido1_pac,
            trim(paciente.mpape2) as apellido2_pac,
            trim(paciente.mpnom1) as nom1_pac,
            trim(paciente.mpnom2) as nom2_pac,
            to_char( paciente.mpfchn,'YYYY-mm-dd') as fecha_naci_pac,
            trim(paciente.mpsexo) as sexo,
            trim(paciente.mptele) as telefono_pac,
            (select p.provincia_descripcion
                from esq_hosvital_rdacaa.provincia_hosvital ph
                inner join esq_rdacaa.provincia p
                on p.provincia_id=ph.idrdacaa 
                where ph.idhosvital=paciente.mdcodd) as provincia_pac,
           (
              select ct.canton_descripcion
              from esq_hosvital_rdacaa.canton_hosvital ch
              inner join esq_rdacaa.canton ct 
              on ct.canton_id=ch.idrdacaa
              where ch.idhosvital_provincia=paciente.mdcodd and ch.idhosvital_canton=paciente.mdcodm
            ) as canton_pac,
            (
              select pr.parroquia_descripcion
              from esq_hosvital_rdacaa.parroquia_hosvital prh
              inner join esq_rdacaa.parroquia pr
              on pr.parroquia_id=prh.idrdacaa
              where prh.idhosvital_provincia=paciente.mdcodd and prh.idhosvital_canton=paciente.mdcodm and prh.idhosvital_parroquia=paciente.mdcodb
            ) as parroquia_pac,
            COALESCE(
                        (select trim(barrio.mdnombe) from maedmb3 barrio where barrio.mdcodd=paciente.mdcodd and barrio.mdcodm=barrio.mdcodm and barrio.mdcodb=paciente.mdcodb and barrio.mdcodbe=paciente.mdcodbe limit 1)
                        ,'') as direccion_pac
    FROM 
      public.capbas paciente
    where paciente.mpcedu='$id' or (COALESCE(paciente.mpape1,'') || COALESCE(paciente.mpape2,'') || COALESCE(paciente.mpnom1,'')|| COALESCE(paciente.mpnom2,'')) like upper('%$id%');";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='".$row['0']."'>
                    <cedula_pac>".$row['0']."</cedula_pac>
                    <tipo_doc_pac>".$row['1']."</tipo_doc_pac>
                    <apellido1_pac>".$row['2']."</apellido1_pac>
                    <apellido2_pac>".$row['3']."</apellido2_pac>
                    <nom1_pac>".$row['4']."</nom1_pac>
                    <nom2_pac>".$row['5']."</nom2_pac>
                    <fecha_naci_pac>".$row['6']."</fecha_naci_pac>
                    <sexo>".$row['7']."</sexo>
                    <telefono_pac>".$row['8']."</telefono_pac>
                    <provincia_pac>".$row['9']."</provincia_pac>
                    <canton_pac>".$row['10']."</canton_pac>
                    <parroquia_pac>".$row['11']."</parroquia_pac>
                    <direccion_pac>".$row['12']."</direccion_pac>
                    </row>";
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

function api_0003($valor){
   conexion_pg('DB_HOSVITALC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT
        trim(medico.mmcodm) as cod_med,
        trim(medico.mtipdoc) as tipo_doc_med,
        trim(medico.mmcedm) as cedula_med,
        trim(medico.mmregm) as cod_msp,
        trim(medico.mape1) as apellido1_med,
        trim(medico.mape2) as apellido2_med, 
        trim(medico.mnom1) as nom1_med,
        trim(medico.mnom2) as nom2_med,
        hc.hcesp as cod_esp,
        (select trim(esp.menome) from maeesp esp where esp.mecode = hc.hcesp) as nom_esp,
        trim(medico.mmtelm) as telefono_med,

        trim(paciente.mpcedu) as cedula_pac,
        hc.hiscsec as secuencial_hc,
        trim(paciente.mptdoc) as tipo_doc_pac,
        trim(paciente.mpape1) as apellido1_pac,
        trim(paciente.mpape2) as apellido2_pac,
        trim(paciente.mpnom1) as nom1_pac,
        trim(paciente.mpnom2) as nom2_pac,
        to_char( paciente.mpfchn,'YYYY-mm-dd') as fecha_naci_pac,
        trim(paciente.mpsexo) as sexo,
        trim(paciente.mptele) as telefono_pac,
        (select p.provincia_descripcion
            from esq_hosvital_rdacaa.provincia_hosvital ph
            inner join esq_rdacaa.provincia p
            on p.provincia_id=ph.idrdacaa 
            where ph.idhosvital=paciente.mdcodd) as provincia_pac,
       (
          select ct.canton_descripcion
          from esq_hosvital_rdacaa.canton_hosvital ch
          inner join esq_rdacaa.canton ct 
          on ct.canton_id=ch.idrdacaa
          where ch.idhosvital_provincia=paciente.mdcodd and ch.idhosvital_canton=paciente.mdcodm
        ) as canton_pac,
        (
          select pr.parroquia_descripcion
          from esq_hosvital_rdacaa.parroquia_hosvital prh
          inner join esq_rdacaa.parroquia pr
          on pr.parroquia_id=prh.idrdacaa
          where prh.idhosvital_provincia=paciente.mdcodd and prh.idhosvital_canton=paciente.mdcodm and prh.idhosvital_parroquia=paciente.mdcodb
        ) as parroquia_pac,
        COALESCE(
                    (select trim(barrio.mdnombe) from maedmb3 barrio where barrio.mdcodd=paciente.mdcodd and barrio.mdcodm=barrio.mdcodm and barrio.mdcodb=paciente.mdcodb and barrio.mdcodbe=paciente.mdcodbe limit 1)
                    ,'') as direccion_pac,
       examenes.prcodi as cod_examen,
       trim(examenes.prnomb) as nom_exa_pac,
       orden.hiscpcan as cantidad,
       trim(orden.hiscpobs) as obs,
       case trim(orden.oprindurg)
       WHEN 'S' THEN
              'URGENTE'
        WHEN 'N' THEN
              'RUTINA'
        WHEN 'C' THEN
              'CONTROL'
       END as prioridad,
       orden.hcdiapt as dias_espera,
       to_char( hc.hiscfk,'YYYY-mm-dd') as fecha_examen

      FROM
      hccom1 hc 
      inner join hccom5 orden
      on orden.hisckey=hc.hisckey  and orden.histipdoc=hc.histipdoc and orden.hiscsec=hc.hiscsec
      inner join capbas paciente
      on paciente.mpcedu=hc.hisckey and paciente.mptdoc=hc.histipdoc
      inner join maemed1 medico
      on medico.mmcodm=hc.hiscmmed
      inner join maepro examenes
      on examenes.tpprcd=2 and examenes.prcodi=orden.hcprccod

      where  hc.fhcindesp='GN' and hc.hisckey = '$id';";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        $c=1;
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='$c'>
                    <cod_med>".$row['0']."</cod_med>
                    <tipo_doc_med>".$row['1']."</tipo_doc_med>
                    <cedula_med>".$row['2']."</cedula_med>
                    <cod_msp>".$row['3']."</cod_msp>
                    <apellido1_med>".$row['4']."</apellido1_med>
                    <apellido2_med>".$row['5']."</apellido2_med>
                    <nom1_med>".$row['6']."</nom1_med>
                    <nom2_med>".$row['7']."</nom2_med>
                    <cod_esp>".$row['8']."</cod_esp>
                    <nom_esp>".$row['9']."</nom_esp>
                    <telefono_med>".$row['10']."</telefono_med>
                    <cedula_pac>".$row['11']."</cedula_pac>
                    <secuencial_hc>".$row['12']."</secuencial_hc>
                    <tipo_doc_pac>".$row['13']."</tipo_doc_pac>
                    <apellido1_pac>".$row['14']."</apellido1_pac>
                    <apellido2_pac>".$row['15']."</apellido2_pac>
                    <nom1_pac>".$row['16']."</nom1_pac>
                    <nom2_pac>".$row['17']."</nom2_pac>
                    <fecha_naci_pac>".$row['18']."</fecha_naci_pac>
                    <sexo>".$row['19']."</sexo>
                    <telefono_pac>".$row['20']."</telefono_pac>
                    <provincia_pac>".$row['21']."</provincia_pac>
                    <canton_pac>".$row['22']."</canton_pac>
                    <parroquia_pac>".$row['23']."</parroquia_pac>
                    <direccion_pac>".$row['24']."</direccion_pac>
                    <cod_examen>".$row['25']."</cod_examen>
                    <nom_exa_pac>".$row['26']."</nom_exa_pac>
                    <cantidad>".$row['27']."</cantidad>
                    <obs>".$row['28']."</obs>
                    <prioridad>".$row['29']."</prioridad>
                    <dias_espera>".$row['30']."</dias_espera>
                    <fecha_orden>".$row['31']."</fecha_orden>
                    </row>";
            $c++;
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}



function api_0004($valor){//Datos de la ordeen por ID
   conexion_pg('DB_HOSVITALC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    $ids = explode("-", $id);
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT
        trim(medico.mmcodm) as cod_med,
        trim(medico.mtipdoc) as tipo_doc_med,
        trim(medico.mmcedm) as cedula_med,
        trim(medico.mmregm) as cod_msp,
        trim(medico.mape1) as apellido1_med,
        trim(medico.mape2) as apellido2_med, 
        trim(medico.mnom1) as nom1_med,
        trim(medico.mnom2) as nom2_med,
        hc.hcesp as cod_esp,
        (select trim(esp.menome) from maeesp esp where esp.mecode = hc.hcesp) as nom_esp,
        trim(medico.mmtelm) as telefono_med,

        trim(paciente.mpcedu) as cedula_pac,
        hc.hiscsec as secuencial_hc,
        trim(paciente.mptdoc) as tipo_doc_pac,
        trim(paciente.mpape1) as apellido1_pac,
        trim(paciente.mpape2) as apellido2_pac,
        trim(paciente.mpnom1) as nom1_pac,
        trim(paciente.mpnom2) as nom2_pac,
        to_char( paciente.mpfchn,'YYYY-mm-dd') as fecha_naci_pac,
        trim(paciente.mpsexo) as sexo,
        trim(paciente.mptele) as telefono_pac,
        (select p.provincia_descripcion
          from esq_hosvital_rdacaa.provincia_hosvital ph
          inner join esq_rdacaa.provincia p
          on p.provincia_id=ph.idrdacaa 
          where ph.idhosvital=paciente.mdcodd) as provincia_pac,
        (
        select ct.canton_descripcion
        from esq_hosvital_rdacaa.canton_hosvital ch
        inner join esq_rdacaa.canton ct 
        on ct.canton_id=ch.idrdacaa
        where ch.idhosvital_provincia=paciente.mdcodd and ch.idhosvital_canton=paciente.mdcodm
        ) as canton_pac,
        (
        select pr.parroquia_descripcion
        from esq_hosvital_rdacaa.parroquia_hosvital prh
        inner join esq_rdacaa.parroquia pr
        on pr.parroquia_id=prh.idrdacaa
        where prh.idhosvital_provincia=paciente.mdcodd and prh.idhosvital_canton=paciente.mdcodm and prh.idhosvital_parroquia=paciente.mdcodb
        ) as parroquia_pac,
        COALESCE(
                  (select trim(barrio.mdnombe) from maedmb3 barrio where barrio.mdcodd=paciente.mdcodd and barrio.mdcodm=barrio.mdcodm and barrio.mdcodb=paciente.mdcodb and barrio.mdcodbe=paciente.mdcodbe limit 1)
                  ,'') as direccion_pac,
        examenes.prcodi as cod_examen,
        trim(examenes.prnomb) as nom_exa_pac,
        orden.hiscpcan as cantidad,
        trim(orden.hiscpobs) as obs,
        case trim(orden.oprindurg)
        WHEN 'S' THEN
            'URGENTE'
        WHEN 'N' THEN
            'RUTINA'
        WHEN 'C' THEN
            'CONTROL'
        END as prioridad,
        orden.hcdiapt as dias_espera,
        to_char( hc.hiscfk,'YYYY-mm-dd') as fecha_examen,
        'CONSULTA EXTERNA' as area,
        case COALESCE( paciente.mpcodetn,'-')
        WHEN '1' THEN
          'BLANCO-A'
        WHEN '2' THEN
          'MESTIZO-A'
        WHEN '3' THEN
          'AFROECUATORIANO-A AFRODESCENDIENTE'
        WHEN '4' THEN
          'INDÍGENA'
        WHEN '5' THEN
          'MONTUBIO-A'
        WHEN '6' THEN
          'NEGRO-A'
        WHEN '7' THEN
          'MULATO-A'
        WHEN '8' THEN
          'OTRO-A'
        WHEN '9' THEN
          'NO SABE-NO RESPONDE'
        ELSE
          'NO SABE-NO RESPONDE'
        END

        FROM
        hccom1 hc 
        inner join hccom5 orden
        on orden.hisckey=hc.hisckey  and orden.histipdoc=hc.histipdoc and orden.hiscsec=hc.hiscsec
        inner join capbas paciente
        on paciente.mpcedu=hc.hisckey and paciente.mptdoc=hc.histipdoc
        inner join maemed1 medico
        on medico.mmcodm=hc.hiscmmed
        inner join maepro examenes
        on examenes.tpprcd=2 and examenes.prcodi=orden.hcprccod
        where  hc.fhcindesp='GN' and hc.hisckey =trim('$ids[0]') and  hc.hiscsec=$ids[1] ;
     ";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        $c=1;
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='$c'>
                    <cod_med>".$row['0']."</cod_med>
                    <tipo_doc_med>".$row['1']."</tipo_doc_med>
                    <cedula_med>".$row['2']."</cedula_med>
                    <cod_msp>".$row['3']."</cod_msp>
                    <apellido1_med>".$row['4']."</apellido1_med>
                    <apellido2_med>".$row['5']."</apellido2_med>
                    <nom1_med>".$row['6']."</nom1_med>
                    <nom2_med>".$row['7']."</nom2_med>
                    <cod_esp>".$row['8']."</cod_esp>
                    <nom_esp>".$row['9']."</nom_esp>
                    <telefono_med>".$row['10']."</telefono_med>
                    <cedula_pac>".$row['11']."</cedula_pac>
                    <secuencial_hc>".$row['12']."</secuencial_hc>
                    <tipo_doc_pac>".$row['13']."</tipo_doc_pac>
                    <apellido1_pac>".$row['14']."</apellido1_pac>
                    <apellido2_pac>".$row['15']."</apellido2_pac>
                    <nom1_pac>".$row['16']."</nom1_pac>
                    <nom2_pac>".$row['17']."</nom2_pac>
                    <fecha_naci_pac>".$row['18']."</fecha_naci_pac>
                    <sexo>".$row['19']."</sexo>
                    <telefono_pac>".$row['20']."</telefono_pac>
                    <provincia_pac>".$row['21']."</provincia_pac>
                    <canton_pac>".$row['22']."</canton_pac>
                    <parroquia_pac>".$row['23']."</parroquia_pac>
                    <direccion_pac>".$row['24']."</direccion_pac>
                    <cod_examen>".$row['25']."</cod_examen>
                    <nom_exa_pac>".$row['26']."</nom_exa_pac>
                    <cantidad>".$row['27']."</cantidad>
                    <obs>".$row['28']."</obs>
                    <prioridad>".$row['29']."</prioridad>
                    <dias_espera>".$row['30']."</dias_espera>
                    <fecha_orden>".$row['31']."</fecha_orden>
                    <area>".$row['32']."</area>
                    <etnia>".$row['33']."</etnia>
                    </row>";
            $c++;
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

//*********** SYS-HPVC ***********************
function api_0001_SYS_HPVC($valor){//muestraProfesional SYS_HPVC
    conexion_pg('DB_HPVC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT 
            m.id_personal as codmed,
            p.nombre1,
            p.nombre2,
            p.apellido1,
            p.apellido2,
            m.cod_msp,
            p.idtipo_documento,
            p.cedula,
            p.telefono,
            0 as cod_espe,
            '' as especialidad
          FROM 
            esq_profesional.medicos m
          inner join esq_datos_personales.personal p
          on p.idpersonal=m.id_personal
          where m.estado='A' and m.id_tipo_profesion=1 and ( p.cedula like '%$id%' or COALESCE(p.apellido1,'') || ' ' || COALESCE(p.apellido2,'') || ' ' || COALESCE(p.nombre1,'') || ' ' || COALESCE(p.nombre2,'') like upper('%$id%'));";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='".$row['0']."'>
                    <cod_med>".$row['0']."</cod_med>
                    <nombre1>".$row['1']."</nombre1>
                    <nombre2>".$row['2']."</nombre2>
                    <apellido1>".$row['3']."</apellido1>
                    <apellido2>".$row['4']."</apellido2>
                    <cod_msp>".$row['5']."</cod_msp>
                    <tipo_docu>".$row['6']."</tipo_docu>
                    <cedula>".$row['7']."</cedula>
                    <telefono>".$row['8']."</telefono>
                    <cod_espe>".$row['9']."</cod_espe>
                    <especialidad>".$row['10']."</especialidad>
                    </row>";
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

function api_0002_SYS_HPVC($valor){//muestraPacientes SYS_HPVC
    conexion_pg('DB_HPVC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT        
            p.documento, 
            p.id_tipodocu,  
            p.apellido1,
            p.apellido2,
            p.nombre1,
            p.nombre2,
            to_char(p.fecha_nacimiento,'YYYY-mm-dd'),
            case p.id_genero when 1 then 'M' else 'F'  end ,
            '' as telefono,
            (SELECT 
                pr.provincia_descripcion
              FROM 
                esq_rdacaa.provincia pr
              where pr.provincia_codigo= p.id_provincia_reci) as provi,
            (
                  SELECT 
                ct.canton_descripcion
              FROM 
                esq_rdacaa.canton ct
              where ct.canton_codigo=p.id_canton_reci and ct.provincia_codigo=p.id_provincia_reci
            ) as canto,
            (
                  SELECT 
                par.parroquia_descripcion
              FROM 
                esq_rdacaa.parroquia par
              where par.parroquia_codigo=p.id_parroquia_reci and par.canton_codigo=p.id_canton_reci
            ) as parro,
            p.referecia_direccion,
            p.id_paciente
          FROM 
            esq_pacientes.pacientes p
          where  p.documento like '%$id%' or COALESCE(p.apellido1,'') || ' ' || COALESCE(p.apellido2,'') || ' ' || COALESCE(p.nombre1,'') || ' ' || COALESCE(p.nombre2,'') like upper('%$id%');";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='".$row['0']."'>
                    <cedula_pac>".$row['0']."</cedula_pac>
                    <tipo_doc_pac>".$row['1']."</tipo_doc_pac>
                    <apellido1_pac>".$row['2']."</apellido1_pac>
                    <apellido2_pac>".$row['3']."</apellido2_pac>
                    <nom1_pac>".$row['4']."</nom1_pac>
                    <nom2_pac>".$row['5']."</nom2_pac>
                    <fecha_naci_pac>".$row['6']."</fecha_naci_pac>
                    <sexo>".$row['7']."</sexo>
                    <telefono_pac>".$row['8']."</telefono_pac>
                    <provincia_pac>".$row['9']."</provincia_pac>
                    <canton_pac>".$row['10']."</canton_pac>
                    <parroquia_pac>".$row['11']."</parroquia_pac>
                    <direccion_pac>".$row['12']."</direccion_pac>
                    </row>";
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

function api_0003_SYS_HPVC($valor){ //MuestraOrdenesLabo SYS-HPVC
   conexion_pg('DB_HPVC');
    global $db_PG;
    $id=clear_text($valor,1);
    $ids = explode("-", $id);
    
   $buscar=array(chr(13).chr(10), "\r\n", "\n", "\r",";",",","'","/","&","<",">");
   $reemplazar=array("", "", "", "", "-","-","" ,"-","y" ," " ," ");
    
    //$all = array();
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT 
    hc.id_profesional,
    (select px.idtipo_documento 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as tipo_docu,
    (select px.cedula 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as cedula_med,
    m.cod_msp, 
    (select px.apellido1 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as apellido1_med,
    (select px.apellido2 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as apellido2_med,
    (select px.nombre1 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as nom1_med,
    (select px.nombre2 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as nom2_med, 
     0 as cod_esp,
     '' as nom_esp,
    (select px.telefono 
          from esq_datos_personales.personal px 
      where px.idpersonal=hc.id_profesional) as telefono_med,  
    COALESCE(pc.documento,'') as cedula,
    --hc.id_paciente,
    hc.id_secuencial,
    pc.id_tipodocu as tipo_doc_pac,
    COALESCE(pc.apellido1,'.') as apellido1_pac,
    COALESCE(pc.apellido2,'.') as apellido2_pac,
    COALESCE(pc.nombre1,'.') as nom1_pac,
    COALESCE(pc.nombre2,'.') as nom2_pac,
    to_char( pc.fecha_nacimiento,'YYYY-mm-dd') as fecha_naci_pac,  
    case pc.id_genero when 1 then 'M' else 'F'  end ,
    '' as telefono_pac,

    (SELECT 
        pr.provincia_descripcion
      FROM 
        esq_rdacaa.provincia pr
      where pr.provincia_codigo=pc.id_provincia_reci ) as provi,
    (
          SELECT 
        ct.canton_descripcion
      FROM 
        esq_rdacaa.canton ct
      where ct.canton_codigo=pc.id_canton_reci and ct.provincia_codigo=pc.id_provincia_reci
    ) as canto,
    (
          SELECT 
        par.parroquia_descripcion
      FROM 
        esq_rdacaa.parroquia par
      where par.parroquia_codigo=pc.id_parroquia_reci and par.canton_codigo=pc.id_canton_reci
    ) as parro,
    pc.referecia_direccion,
    pro.cod_procedimiento,
    trim(pro.descripcion) examen,
    sp.cantidad,
    sp.observacion_solicitud,
    tp.descripcion,
    sp.num_dias,
    to_char( hc.fecha_atencion,'YYYY-mm-dd') as fecha_examen,
    a.nombre as area,
    'NO SABE-NO RESPONDE' as etnia

  FROM 
    esq_pacientes.historia_clinica hc
  inner join esq_laboratorio.solicitud_procedimiento sp
  on sp.id_paciente=hc.id_paciente and sp.id_secuencial=hc.id_secuencial
  inner join esq_profesional.medicos m
  on m.id_personal=hc.id_profesional
  inner join esq_pacientes.pacientes pc
  on pc.id_paciente=hc.id_paciente
  inner join esq_datos_personales.personal p
  on p.idpersonal=hc.id_profesional
  inner join esq_laboratorio.procedimientos pro 
  on pro.id_procedimiento=sp.id_procedimiento
  inner join esq_laboratorio.tipo_prioridad tp
  on tp.idtipo_prioridad=sp.idtipo_prioridad
  inner join esq_catalogos.area a
  on a.idarea=hc.id_origen
  where hc.id_paciente=$ids[0]  and hc.id_secuencial=$ids[1] and sp.id_orden= $ids[2];";
   $result.= "<rows>";
    if ($rs = $db_PG->Execute($sql)){
        $c=1;
        foreach($rs as $k => $row) { 
            //$all['datos_out']=$row;     
          $result.="<row id='$c'>
                    <cod_med>".$row['0']."</cod_med>
                    <tipo_doc_med>".$row['1']."</tipo_doc_med>
                    <cedula_med>".$row['2']."</cedula_med>
                    <cod_msp>".$row['3']."</cod_msp>
                    <apellido1_med>".$row['4']."</apellido1_med>
                    <apellido2_med>".$row['5']."</apellido2_med>
                    <nom1_med>".$row['6']."</nom1_med>
                    <nom2_med>".$row['7']."</nom2_med>
                    <cod_esp>".$row['8']."</cod_esp>
                    <nom_esp>".$row['9']."</nom_esp>
                    <telefono_med>".$row['10']."</telefono_med>
                    <cedula_pac>".$row['11']."</cedula_pac>
                    <secuencial_hc>".$row['12']."</secuencial_hc>
                    <tipo_doc_pac>".$row['13']."</tipo_doc_pac>
                    <apellido1_pac>".$row['14']."</apellido1_pac>
                    <apellido2_pac>".$row['15']."</apellido2_pac>
                    <nom1_pac>".$row['16']."</nom1_pac>
                    <nom2_pac>".$row['17']."</nom2_pac>
                    <fecha_naci_pac>".$row['18']."</fecha_naci_pac>
                    <sexo>".$row['19']."</sexo>
                    <telefono_pac>".$row['20']."</telefono_pac>
                    <provincia_pac>".str_ireplace($buscar,$reemplazar,trim($row['21']))."</provincia_pac>
                    <canton_pac>".str_ireplace($buscar,$reemplazar,trim($row['22']))."</canton_pac>
                    <parroquia_pac>".str_ireplace($buscar,$reemplazar,trim($row['23']))."</parroquia_pac>
                    <direccion_pac>".str_ireplace($buscar,$reemplazar,trim($row['24']))."</direccion_pac>
                    <cod_examen>".$row['25']."</cod_examen>
                    <nom_exa_pac>".str_ireplace($buscar,$reemplazar,trim($row["26"]))."</nom_exa_pac>
                    <cantidad>".$row['27']."</cantidad>
                    <obs>".str_ireplace($buscar,$reemplazar,trim($row['28']))."</obs>
                    <prioridad>".$row['29']."</prioridad>
                    <dias_espera>".$row['30']."</dias_espera>
                    <fecha_orden>".$row['31']."</fecha_orden>
                    <area>".str_ireplace($buscar,$reemplazar,trim($row['32']))."</area>
                    <etnia>".str_ireplace($buscar,$reemplazar,trim($row['33']))."</etnia>
                    </row>";
            $c++;
        }

    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

function api_0004_SYS_HPVC($valor){//Listar citas SYS_HPVC
    conexion_pg('DB_HPVC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="SELECT  
                a.id_registro,
                COALESCE((SELECT   
                  t.nombre
                FROM 
                  esq_agendamiento.tipo_atencion t 
                  where t.id_tipo_atencion=a.id_tipo_atencion),'NO DEFINIDO') as tipo ,                		
    		       INITCAP(concat(d.apellido1,' ', d.apellido2,' ', d.nombre1,' ', d.nombre2)) as medico,
                    (s.nombre)  as especialidad, 
                    to_char(a.fecha,'dd/mm/YYYY') as fecha_cita,
                    to_char( a.hora,'HH24:MI') as hora_cita,
                    COALESCE(p.documento,'INDOCUMENTADO') as documento,
                    INITCAP(concat(p.apellido1,' ', p.apellido2,' ', p.nombre1,' ',p.nombre2)) as paciente,
                    e.descripcion as estado,
                    a.id_estado,
                    a.id_paciente,
                    date_part('year',age(p.fecha_nacimiento)) as anios,
                    date_part('month',age(p.fecha_nacimiento)) as meses,
                    date_part('day',age(p.fecha_nacimiento )) as dias,
                    to_char(p.fecha_nacimiento,'YYYY-mm-dd') as fecha_naci
                    
                FROM   esq_agendamiento.agenda a  
                inner join esq_agendamiento.agenda_estado e on a.id_estado=e.id_estado
                inner join esq_pacientes.pacientes p on a.id_paciente=p.id_paciente
                inner join esq_datos_personales.personal d on d.idpersonal=a.id_medico
                inner join esq_catalogos.especialidad s on a.id_especialidad=s.id_especialidad 
                WHERE p.documento = '$id' and  a.id_estado in(1,4,6) and a.fecha >=CURRENT_DATE
                order by a.fecha DESC, a.hora DESC;";
   $result.= "<rows>";
   $d=0;
    if ($rs = $db_PG->Execute($sql)){
        foreach($rs as $k => $row) { 
             $d++;
             $hora_cita=($row['5']=='23:59'?'TURNO EXTRA':$row['5']);
          $result.="<row>
                    <num>$d</num>
                    <ico1>ico1*</ico1>
                    <id_cita>".$row['0']."</id_cita>
                    <tipo_cita>".$row['1']."</tipo_cita>
                    <nom_medico>".$row['2']."</nom_medico>
                    <nom_especi>".$row['3']."</nom_especi>
                    <fecha_cita>".$row['4']."</fecha_cita>
                    <hora_cita>".$hora_cita."</hora_cita>
                    <doc_paci>".$row['6']."</doc_paci>
                    <nom_paci>".$row['7']."</nom_paci>
                    <estado>".$row['8']."</estado>
                    <id_estado>".$row['9']."</id_estado>
                    <id_paciente>".$row['10']."</id_paciente>
                    <fecha_naci>".$row['14']."</fecha_naci>
                    <anios>".$row['11']."</anios>
                    <meses>".$row['12']."</meses>
                    <dias>".$row['13']."</dias>
                    </row>";
        }
        if($d<1){
            $result.="<row>
                    <id_cita>-</id_cita>
                    <ico1>-</ico1>
                    <tipo_cita>-</tipo_cita>
                    <nom_medico>No hay registros a listar</nom_medico>
                    <nom_especi>-</nom_especi>
                    <fecha_cita>-</fecha_cita>
                    <hora_cita>-</hora_cita>
                    <doc_paci>-</doc_paci>
                    <nom_paci>-</nom_paci>
                    <estado>-</estado>
                    <id_estado>-</id_estado>
                    <id_paciente>-</id_paciente>
                    <fecha_naci>-</fecha_naci>
                    <anios>-</anios>
                    <meses>-</meses>
                    <dias>-</dias>
                    </row>";
        }
    }
    $result.= "</rows>";
    //$x=json_encode($rs->GetArray());      
    $db_PG->Close();
    //return $all;    
    //return array("datos_out" => $x);
    return array("datos_out" => $result);
}

function api_0005_SYS_HPVC($valor){//Listar citas SYS_HPVC
    conexion_pg('DB_HPVC');
    global $db_PG;
    $id=clear_text($valor,1);
    //$all = array();
    
    $result="<?xml version='1.0' encoding='utf-8'?>\n";
   $sql="                
            SELECT  
                a.id_registro,
                substring('*' || a.id_registro || p.documento from 1 for 13 ) as cod1,
                '*' || a.id_registro || ' ' || p.documento  || '*' as cod2,
                to_char(a.fecha_registro,'dd/mm/YYYY HH24:MI:SS') as fecha_reservado,
                 COALESCE(p.documento,'INDOCUMENTADO') as documento,
                 INITCAP(concat(p.apellido1,' ', p.apellido2,' ', p.nombre1,' ',p.nombre2)) as paciente,
                 to_char(p.fecha_nacimiento,'dd/mm/YYYY') as fecha_naci,
                 date_part('year',age(p.fecha_nacimiento)) as anios,
                 date_part('month',age(p.fecha_nacimiento)) as meses,
                 date_part('day',age(p.fecha_nacimiento )) as dias,
                 (
                  SELECT 
                      g.descripcion
                    FROM 
                      esq_datos_personales.genero g
                      where g.idgenero=p.id_genero             
                  ) as sexo,
                 p.referecia_direccion,
                 p.telefono,
                 '-' as tele2,   
                  '-' as tele3,   
                  'MINISTERIO DE SALUD' as contrato,
                  (SELECT                                  
                      COALESCE(mc.observacion,'-')
                    FROM 
                      esq_agendamiento.movimientos_cita mc
                    where  mc.id_estado=1 and mc.id_registro=a.id_registro limit 1) as autorizado,
                   --to_char(a.fecha,'dd/mm/YYYY') as fecha_cita,
                   a.fecha,
                    to_char( a.hora,'HH24:MI') as hora_cita, 
                    '-' as duracion,
                   'HOSPITAL DR. VERDI CEVALLOS BALDA' as sede,
                    '12 DE MARZO' AS barrio,
                    'PORTOVIEJO' as ciudad, 
                  (SELECT                     
                      cs.nombre
                    FROM 
                      esq_agendamiento.consultorio cs
                    where   cs.id_consultorio=ac.id_consultorio limit 1) as nom_consul,
                  '-' as valor,
                  '-' as procedimiento,
                  a.id_medico as cod_medi,
                   INITCAP(concat(d.apellido1,' ', d.apellido2,' ', d.nombre1,' ', d.nombre2)) as medico,
                   s.nombre  as especialidad, 
                  'ESTIMADO USUARIO LE RECORDAMOS ACERCARSE A LA VENTANILLA #2 CON 30 MINUTOS DE ANTICIPACION A CONFIRMAR SU CITA MEDICA' as mensaje,
                  (
                  select   INITCAP(concat(r.apellido1,' ', r.apellido2,' ', r.nombre1,' ', r.nombre2))
                  from esq_datos_personales.personal r
                  where r.idpersonal in  (SELECT                                  
                      mc.id_responsable
                    FROM 
                      esq_agendamiento.movimientos_cita mc
                    where  mc.id_estado=1 and mc.id_registro=a.id_registro limit 1)
                  )    as nom_res
                    
                FROM   esq_agendamiento.agenda a  
               inner join esq_agendamiento.agenda_cabecera ac
                on ac.id_agenda=a.id_agenda
                inner join esq_agendamiento.agenda_estado e on a.id_estado=e.id_estado
                inner join esq_pacientes.pacientes p on a.id_paciente=p.id_paciente
                inner join esq_datos_personales.personal d on d.idpersonal=a.id_medico
                inner join esq_catalogos.especialidad s on a.id_especialidad=s.id_especialidad 
                WHERE a.id_registro=$id; ";
   $result.= "<rows>";
   $d=0;
    if ($rs = $db_PG->Execute($sql)){
        foreach($rs as $k => $row) { 
             $d++;
             $hora_cita=($row['18']=='23:59'?'TURNO EXTRA':$row['18']);
          $result.="<row >
                    <numero_cita>".$row['0']."</numero_cita>
                    <cod1>".$row['1']."</cod1>
                    <cod2>".$row['2']."</cod2>
                    <fecha_res>".$row['3']."</fecha_res>
                    <documento_paci>".$row['4']."</documento_paci>
                    <nom_paci>".$row['5']."</nom_paci>
                    <fecha_naci>".$row['6']."</fecha_naci>
                    <anios>".$row['7']."</anios>
                    <meses>".$row['8']."</meses>
                    <dias>".$row['9']."</dias>
                    <sexo>".$row['10']."</sexo>
                    <direccion>".$row['11']."</direccion>
                    <telef>".$row['12']."</telef>
                    <telef2>".$row['13']."</telef2>
                    <telef3>".$row['14']."</telef3>
                    <contrato>".$row['15']."</contrato>
                    <autorizacion>".$row['16']."</autorizacion>                        
                    <fecha_cita>".$row['17']."</fecha_cita>
                    <hora_cita>".$hora_cita."</hora_cita>                            
                    <duracion>".$row['19']."</duracion>
                    <sede>".$row['20']."</sede>
                    <barrio>".$row['21']."</barrio>                        
                    <ciudad>".$row['22']."</ciudad>
                    <consultorio>".$row['23']."</consultorio>                        
                    <valor>".$row['24']."</valor>
                    <procedimiento>".$row['25']."</procedimiento>
                    <cod_medi>".$row['26']."</cod_medi>                        
                    <nom_medi>".$row['27']."</nom_medi>
                    <especialidad>".$row['28']."</especialidad>                        
                    <mensaje>".$row['29']."</mensaje>
                    <nom_res>".$row['30']."</nom_res>
                    </row>";
        }
        if($d<1){
            $result.="<row>
                    <numero_cita>-</numero_cita>
                    <cod1>-</cod1>
                    <cod2>-</cod2>
                    <fecha_res>-</fecha_res>
                    <documento_paci>-</documento_paci>
                    <nom_paci>-</nom_paci>
                    <fecha_naci>-</fecha_naci>
                    <anios>-</anios>
                    <meses>-</meses>
                    <dias>-</dias>
                    <sexo>-</sexo>
                    <direccion>-</direccion>
                    <telef>-</telef>
                    <telef2>-</telef2>
                    <telef3>-</telef3>
                    <contrato>-</contrato>
                    <autorizacion>-</autorizacion>                        
                    <fecha_cita>-</fecha_cita>
                    <hora_cita>-</hora_cita>                            
                    <duracion>-</duracion>
                    <sede>-</sede>
                    <barrio>-</barrio>                        
                    <ciudad>-</ciudad>
                    <consultorio>-</consultorio>                        
                    <valor>-</valor>
                    <procedimiento>-</procedimiento>
                    <cod_medi>-</cod_medi>                        
                    <nom_medi>-</nom_medi>
                    <especialidad>-</especialidad>                        
                    <mensaje>-</mensaje>
                    <nom_res>-</nom_res>
                    </row>";
        }
    }
    $result.= "</rows>";   
    $db_PG->Close();
    return array("datos_out" => $result);
   
}


if(!isset($HTTP_RAW_POST_DATA)){
    $HTTP_RAW_POST_DATA=  file_get_contents('php://input');
}

//if (!doAuthenticate()){return "Invalid username or password";}

$ns="urn:SysHPVC";

$server= new soap_server();
$server->soap_defencoding = 'UTF-8'; 
$server->configureWSDL("SysHPVC",$ns);
$server->schemaTargetNamespace = $ns;
//$server->debug_flag=true; 

$server->wsdl->addComplexType(
'profesional',
'complexType',
'struct',
'sequence',
'',
array(  'cod_med' => array('name' => 'cod_med', 'type' => 'xsd:string'),
        'nombre1' => array('name' => 'nombre1', 'type' => 'xsd:string'),
        'nombre2' => array('name' => 'nombre2', 'type' => 'xsd:string'),    
        'apellido1' => array('name' => 'apellido1', 'type' => 'xsd:string'),
        'apellido2' => array('name' => 'apellido2', 'type' => 'xsd:string'),    
        'cod_msp' => array('name' => 'cod_msp', 'type' => 'xsd:string'),
        'tipo_docu' => array('name' => 'tipo_docu', 'type' => 'xsd:string'),    
        'cedula' => array('name' => 'cedula', 'type' => 'xsd:string'),
        'telefono' => array('name' => 'telefono', 'type' => 'xsd:string'),
        'cod_espe' => array('name' => 'cod_espe', 'type' => 'xsd:string'),
        'especialidad' => array('name' => 'especialidad', 'type' => 'xsd:string')
    )
);




$server->register("api_0001", //muestraProfesional
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0001', //accion
        'document',//estilo
        'literal',//uso
        'Muestra Profesionales'// Descripcion
        );

$server->register("api_0002", //MuestraPacientes
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0002', //accion
        'document',//estilo
        'literal',//uso
        'Muestra Pacientes'// Descripcion
        );

$server->register("api_0003", //Muestra ordenes laboratorio
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0003', //accion
        'document',//estilo
        'literal',//uso
        'Muestra ordenes laboratorio'// Descripcion
        );
$server->register("api_0004", //Muestra ordenes laboratorio por id
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0004', //accion
        'document',//estilo
        'literal',//uso
        'Muestra ordenes laboratorio por id'// Descripcion
        );

$server->register("api_0001_SYS_HPVC", //muestraProfesional SYS_HPVC
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0001_SYS_HPVC', //accion
        'document',//estilo
        'literal',//uso
        'Muestra Profesionales SYS_HPVC'// Descripcion
        );

$server->register("api_0002_SYS_HPVC", //MuestraPacientes SYS_HPVC
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0002_SYS_HPVC', //accion
        'document',//estilo
        'literal',//uso
        'Muestra Pacientes SYS_HPVC'// Descripcion
        );

$server->register("api_0003_SYS_HPVC", //MuestraOrdenesLabo SYS_HPVC
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0003_SYS_HPVC', //accion
        'document',//estilo
        'literal',//uso
        'Muestra Ordenes Laboratorio SYS_HPVC'// Descripcion
        );

$server->register("api_0004_SYS_HPVC", //ListarCitas SYS_HPVC
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0004_SYS_HPVC', //accion
        'document',//estilo
        'literal',//uso
        'Lista citas SYS_HPVC'// Descripcion
        );
$server->register("api_0005_SYS_HPVC", //ListarCitas SYS_HPVC
        array('valor'=>'xsd:string'),//parametros
        array('datos_out'=>'xsd:string'),//respuesta
        $ns, //namespace
        $ns.'#api_0005_SYS_HPVC', //accion
        'document',//estilo
        'literal',//uso
        'Lista cita SYS_HPVC'// Descripcion
        );

$server->service($HTTP_RAW_POST_DATA);


