<html>
<head>
    <title>Consulta Citas - SYSHPVC</title>
    <script src="js/jquery-3.4.1.min.js" type="text/javascript"></script>
    <script src="js/suite_gpl/codebase/suite.js" type="text/javascript"></script>
    <link href="js/suite_gpl/codebase/suite.css" rel="stylesheet" type="text/css"/>
    <style>
        html, body {
                width: 100%;
                height: 100%;
                margin: 0px;
                padding: 0px;
                overflow: hidden;
        }
    </style>
    <script>
var p_g_hpvc=0;
var max_btn=5;
var dataset = [
    {
        "value": "",
        "short": "",
        "shortDescription": "",
        "thumbnailName": "telemedicina.jpg"
    }
];
function cargar_p(p){
	let windowHTML
	switch(p) {
	  case 0:
	    windowHTML = "<img style='display: block; width: 200px; height: 200px; margin-top: 20px; margin-left: auto; margin-right: auto' src='img/telemedicina.jpg'><p>El Hospital Dr. Verdi Cevallos Balda, le da la bien venida a nuestro portal de consulta citas.<br>A continuacion te guiaremos en el uso de esta herramienta, para obtener informacion de tu cita medica.</p>";
	    break;
	  case 1:
	    windowHTML = "<p><b>Paso 1.</b><br>Escribir el numero de cedula o pasaporte del paciente.<br><br><b>Paso 2.</b><br>Dar clic en el Boton Consultar.</p><img style='display: block; margin-top: 20px; width: 400px;  margin-left: auto; margin-right: auto' src='img/1-1.jpeg'>";
	    break;
	 case 2:
	    windowHTML = "<p><b>Paso 3.</b><br>Si el paciente cuenta con citas agendadas, se mostrara el listado de las mismas.</p><img style='display: block; width: 400px; height: 200px; margin-top: 20px; margin-left: auto; margin-right: auto' src='img/2-3.jpeg'>";
	    break;
	 case 3:
	    windowHTML = "<p><b>Informacion.</b><br>Debido a la emergencia sanitaria por la cual se encuentra atravesando el pais y principalmente pensando en el bienestar de nuestros pacientes el Hospital Dr. Verdi Cevallos Balda implementara nuevas modalidades de atencion en la consulta externa, entre las cuales se encuentran:</p><ul><li><b>LLamada Telefonica</b><br>El medico tratante se comunicara via telefonica con el paciente.</li><li><b>Video Consulta</b><br>El medico tratante realizara la atencion mediante una Video Llamada al paciente.</li><li><b>Presencial</b><br>El paciente debe asistir a la institucion a una cita presencial.</li></ul><b>Nota:</b> El personal de agendamiento de nuestra institucion se contactara con el paciente, para determinar a que modalidad de atencion se puede acoger.";
	    break;
 	case 4:
	    windowHTML = "<p><b>Video Consulta.</b><br>Teniendo como prioridad el bienestar de nuestros pacientes el Hospital Dr. Verdi Cevallos Balda implementara esta modalidad, en la cual el medico tratante realizara la atencion utilizando como medio de comunicacion una video llamada al paciente.<br> Cuando se encuentre asignada una video consulta se mostrara en la lista de citas como en la siguiente imagen: </p><img style='display: block; width: 400px; margin-top: 20px; margin-left: auto; margin-right: auto' src='img/5-1.jpeg'>";
	    break;
	case 5:
	    windowHTML = "<p><h2>Como acceder a mi Video Consulta.</h2><b>Paso 1.</b><br>Para acceder a la video consulta se requiere una conexion a internet estable y una de las siguientes opciones:<ul><li><b>Computador con camara, microfono y altavoz o auriculares.</b></li><li><b>SmartPhone o Tablet con Android 5 o superior.</b></li><li><b>Iphone, Ipad o Ipod Touch  con IOS 11 o superior.</b></li></ul>Para instalar la herramienta de video consulta en tu dispositivo movil dar clic en el boton:<br> </p><img style='display: block; width: 350px; height: 40px;  margin-top: -10px; margin-left: auto; margin-right: auto' src='img/6-1.jpeg'><b>Nota:</b> Desde un computador se accede a la video consulta desde el navegador web, se recomienda el uso de Mozilla FireFox o Google Chrome en sus ultimas versiones.";
	    break;
	  default:
	    windowHTML = "En construccion";
	} 
	return windowHTML;

}
function template(item) {
				var template = "<div style='height:80px' >";
				template = "<h2 class='title'><img width='50' height='50' src='img/" + item.thumbnailName + "'/> Descargar App Video Consulta</h2>";
				template += "<h2 class='title'>" + item.value + "</h2>";				
				template += "</div>";
				return template;
			}

                    var layout;
                    function doOnLoad() {
                             layout = new dhx.Layout(document.body, {   
                                    rows: [
					{
						id: "header",
						html: `<div align="center"><img   src="img/verdi1.jpg"  alt=""/></div>`,
						css: "dhx_layout-cell--border_bottom",
						gravity: false,
						height: "100px"
					}
                                        ,
					{
						id: "toolbar",
						html: "<h2>Footer</h2>",
						css: "dhx_layout-cell--border_top",
						gravity: false,
						height: "200px"
					},
					/*{
						id: "app",
						html: "<h2>App</h2>",
						css: "dhx_layout-cell--border_bottom",
						gravity: false,
						height: "80px"
					},*/
					{
                                            cols: [

                                                    {
                                                        rows: [
                                                                {
                                                                        id: "content",
                                                                        css: "",
                                                                        html: "<h2>Content</h2>"
                                                                }
                                                        ]
                                                    }
                                            ]
					}
				]
                                });
			/*var dataview_app = new dhx.DataView(null,{
				itemsInRow: 2,
				gap: 10,
				css: "dhx_widget--bordered",
				template: template
			    });
		dataview_app.data.parse(dataset);*/
		
      
                        var grid_citas = new dhx.Grid(null, {
                                columns: [
                                    { width: 50,id: "num", header: [{ text: "#" }] },
                                    { hidden: true, id: "id_cita", header: [{ text: "" }] },
                                    { hidden: true, id: "3", header: [{ text: "" }] },
                                    { width: 50, id: "ico1", htmlEnable: true , header: [{ text: "" }] },
                                    {  id: "tipo_cita", header: [{ text: "Tipo Consulta" }] },
                                    {  id: "nom_medico", header: [{ text: "Profesional" }] },
                                    {  id: "nom_especi", header: [{ text: "Especialidad" }] },
                                    {  id: "fecha_cita", header: [{ text: "Fecha" }] },
                                    {  id: "hora_cita", header: [{ text: "Hora" }] },
                                    { hidden: true, id: "10", header: [{ text: "Duración" }] },
                                    { hidden: true, id: "nom_paci", header: [{ text: "Paciente" }] },
				    {  hidden: true, id: "id_tipo_c", header: [{ text: "id_t_c" }] },
				    {  id: "tipo_c", header: [{ text: "T. Cita" }] },
				    { width: 50, id: "bnt_tipo_c",  htmlEnable: true , header: [{ text: "" }] },
{  width: 150, id: "cod_cita", header: [{ text: "Cod Video Consulta" }] }
                                ],
                                columnsAutoWidth: true,
                                headerRowHeight: 40,
                                selection: "row"
                            });
                      
                    var form_citas = new dhx.Form(null, {
				cellCss: "dhx_layout-cell--border_bottom",
				padding: "30",
				rows: [
					{
                                            //title: "Align:",
                                            //padding: "10px",
                                            //cellCss: "dhx_layout-cell--border_bottom",
                                            cols: [
                                                   
                                                    {
                                                        type: "input",
                                                        label: "Cedula/Pasaporte:",
                                                        labelInline: true,
                                                        icon: "dxi dxi-magnify",
                                                        name: "docu_paci",
                                                        labelWidth: "40%",
                                                        width:"30%",
                                                       // required: true,
                                                        placeholder: "Ingrese su # cedula",
                                                        id:"docu_paci",
                                                        gravity: false
                                                    },
                                                    
                                                    {
                                                           gravity: false,
                                                            type: "button",
                                                            submit: true,
                                                            value: "Consultar",
                                                            size: "medium",
                                                            view: "flat",
                                                            color: "primary",
                                                            id: "button_id"
                                                    }
						]
						
					},
                                        {
						type: "input",
						label: "Nombres Paciente:",
						labelInline: true,						
						name: "nom_paciente",
						labelWidth: "130px",						
						placeholder: "",
						id:"nom_paciente",
                                                disabled:true
					},
					{
			                           gravity: false,
			                            type: "button",
			                            submit: true,
			                            value: "Descargar App Video Consulta",
			                            size: "medium",
			                            view: "flat",
			                            color: "primary",
			                            id: "button_app"
			                    }
				]
			});
                            
                    layout.cell("content").attach(grid_citas);
                    layout.cell("toolbar").attach(form_citas);
		   

			
			
			var dhxWindow = new dhx.Window(
					{
					width: 440, 
					height: 520, 
					title: "Bienvenido a la guia del SYS-HPVC", 
					modal: true,
					footer: true
					}
					);
			
			dhxWindow.footer.data.add({
					type: "spacer",
				});
			dhxWindow.footer.data.add({
					type: "button",
					view: "link",
					size: "medium",
					color: "primary",
					value: "Cancelar",
					id: "bnt_1"
				});
			dhxWindow.footer.data.add({
					type: "button",
					view: "flat",
					size: "medium",
					color: "primary",
					value: "Comenzar",
					id: "bnt_2",
				});

			dhxWindow.footer.events.on("click", function(id){
				let bt_n='';
				if (id === "bnt_1" && p_g_hpvc<=0 ) {
						dhxWindow.hide();
					}
				if (id === "bnt_2"){
					p_g_hpvc++;
				        if(p_g_hpvc>max_btn){p_g_hpvc=max_btn;}
					//if (p_g_hpvc>0){
					dhxWindow.footer.data.update("bnt_2", {value: "Siguiente"});
					dhxWindow.footer.data.update("bnt_1", {value: "Atras"});
					 
					/*}else{
					dhxWindow.footer.data.update("bnt_2", {value: "Comenzar"});
					dhxWindow.footer.data.update("bnt_1", {value: "Cancelar"});
					
					}*/
					
				}
				if (id === "bnt_1"){
					p_g_hpvc--;
				        if(p_g_hpvc<0){p_g_hpvc=0;}
					if (p_g_hpvc>0){
					dhxWindow.footer.data.update("bnt_2", {value: "Siguiente"});
					dhxWindow.footer.data.update("bnt_1", {value: "Atras"});
					
					}else{
					dhxWindow.footer.data.update("bnt_2", {value: "Comenzar"});
					dhxWindow.footer.data.update("bnt_1", {value: "Cancelar"});
					
					}
					
				}
				
				dhxWindow.attachHTML(cargar_p(p_g_hpvc));	
				});
			dhxWindow.attachHTML(cargar_p(0));
			dhxWindow.show();
                    
                    form_citas.events.on("ValidationFail", function(id,component){
			
                          /*dhx.message({
                                node:"message_container",
                                text:"Los campos marcados<br>con rojo son obligatorios!",
                                css:"dhx_message--error",
                                icon:"dxi-close", 
                                expire:3000
                            });*/
                       
                    });

		  /*form_citas.events.on("Change", function(name,new_value){
			
                          //alert(new_value);
                       
                    });*/
		/*form_citas.events.on("onEnter",function(){
				alert("onEnter event triggered<br>");
			});*/
		/*let txt_doc=form_citas.getItem("docu_paci");
		$(txt_doc).keypress(function(e) { log(e); });*/

                    form_citas.events.on("ButtonClick", function(id,e){
		      if(id==='button_app'){
			window.open("https://jitsi.org/#download","Video Consulta SYS-HPVC");
			}
                        if(id==='button_id'){
				
		           let vd=form_citas.getValue();
				
                           if(vd.docu_paci===''){
				dhx.message({
		                        node:"message_container",
		                        text:"Debe ingresar el numero de <br>cedula o pasaporte del paciente!",
		                        css:"dhx_message--error",
		                        icon:"dxi-close", 
		                        expire:3000
		                    });
				return;
				//alert('no');
				}
                            var datos_form = form_citas.getValue();
                           
                          
                            
                            grid_citas.data.load("listar_citas.php?id="+datos_form.docu_paci).then(function(){
                               var id = grid_citas.data.getId(0); // -> returns "1"
                               var item = grid_citas.data.getItem(id);
                               form_citas.setValue({"nom_paciente":item.nom_paci});
                              
                            });
                        }
                    });
                    
                   grid_citas.events.on("CellClick", function(row,column,e){     
                        
                        let id=row.id_cita;
			let id_t_c=row.id_tipo_c;
			 //alert(column.id);
                        switch(column.id) {
                            case "id_cita":
                             
                              if(id!=='-'){
                                  f_mostrar_pdf(id);
                              }
				break;  
                             case "hora_cita":
                             
                              if(id_t_c==='2'){
                                  window.open("https://meet.jit.si/hpvc-2020","Video Consulta SYS-HPVC") 
                              } 
                              break;                       
                          } 
                   });
                   
                    
                }
   function f_mostrar_pdf(id_x){
        var dhxWindow = new dhx.Window({width: 800, height: 600, title: "Reporte de Cita Medica", modal: true});
        var p_data={id:id_x};
        var v_contenido_url = 'reporte_pdf.php';       
         $.ajax({
                    type    : 'POST',
                    async   : true,
                    data    : p_data,
                    url     :v_contenido_url,
                    success : function(valor){
                       
                            if(valor!==''){
                               dhxWindow.attachHTML(valor);
                               dhxWindow.show();                                                   
                            }
                        }
                });
        
   }
    </script>
</head>
<body onload="doOnLoad();">
	
</body>
</html>
