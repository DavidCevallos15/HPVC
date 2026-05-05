<?php
//include_once("adodb5/adodb-exceptions.inc.php"); 
include_once('adodb5/adodb.inc.php');
include_once('adodb5/adodb-active-record.inc.php');
include_once('adodb5/adodb-pager.inc.php');
include_once('adodb5/adodb-perf.inc.php');
adodb_perf::table('esq_log.adodb_logsql');


$key_serv="";
$key_erick= "*";
$version_local="1";
$version_serv="0";
try {

//********* POSTGRESQL    
$db_PG =NewADOConnection('postgres');


function conexion_pg($base="DB_HPVC"){
    global $db_PG;
    global $key_serv;
    global $key_erick;

    if($key_serv==$key_erick)
    {
        switch (strtoupper(trim($base))) {
		case "DB_HPVC": $serv=$_SESSION["server_pg"];$user=$_SESSION["user_pg"]; $clv=$_SESSION["clav_pg"]; $base=$_SESSION["base_pg"]; break;	
                
		default: 
			$serv=$_SESSION["server_pg"];$user=$_SESSION["user_pg"]; $clv=$_SESSION["clav_pg"]; $base=$_SESSION["base_pg"];
		}
    }
    else
    {
        switch (strtoupper($base)) {
		case "DB_HPVC": $serv=$_SESSION["server_pg"];$user=$_SESSION["user_pg"]; $clv=$_SESSION["clav_pg"]; $base=$_SESSION["base_pg"]; break;
                case "DB_HOSVITALC": $serv=$_SESSION["server_pg_hosvital"];$user=$_SESSION["user_pg_hosvital"]; $clv=$_SESSION["clav_pg_hosvital"]; $base=$_SESSION["base_pg_hosvitalc"]; break;
                case "DB_HOSVITALF": $serv=$_SESSION["server_pg_hosvital"];$user=$_SESSION["user_pg_hosvital"]; $clv=$_SESSION["clav_pg_hosvital"]; $base=$_SESSION["base_pg_hosvitalf"]; break;
		default: 
			$serv=$_SESSION["server_pg"];$user=$_SESSION["user_pg"]; $clv=$_SESSION["clav_pg"]; $base=$_SESSION["base_pg"];
		}
    }
    if (!$db_PG->Connect($serv, $user, $clv, $base))
    {
        echo "Problemas de Conexion, Intente luego. >$serv, $base  ->".$db_PG->ErrorMsg();
        trigger_error(htmlentities("Problemas de Conexion *", ENT_QUOTES), E_USER_ERROR);
    }

}  
} catch (exception $e) { 
		var_dump($e); 
	} 
?>
