$(function(){
  var estudiantes = {};
  var nombres = [];
  $("#autor").typeahead({
                minLength: 3,
                items: 30,
		source: function ( query, process ) {
		//get the data to populate the typeahead (plus an id value)
			$.ajax({url: 'http://127.0.0.1:3000/autocompletar_pareja.json',
                               headers: { Accept : "application/json; charset=utf-8", "Content-Type": "application/json; charset=utf-8" },
                               cache: false,
                               data: {'query': query,
                                      'periodo_academico_egreso':$("#periodo_academico_egreso").val(),
                                      'ano_lectivo_egreso':$("#ano_lectivo_egreso").val(),
                                      'escuela':$("#escuela").val(),
                                      'cedula':$("#cedula").val()
                                     },
                               success: function(data){
                                        //reset these containers every time the user searches
                                        //because we're potentially getting entirely different results from the api
                                         estudiantes = {};
                                         nombres = [];
                                         //var json = JSON.parse( data );
                                         for(var i in data) {
                                           //console.log(data[i]);
                                           nombres.push( data[i].nombre_completo ) 
                                           estudiantes[data[i].nombre_completo] = {'cedula':data[i].cedula,
                                                                                    'nombres_pareja':data[i].nombres_pareja,
                                                                                    'apellidos_pareja':data[i].apellidos_pareja,
                                                                                    'correo_pareja':data[i].correo_pareja,
                                                                                   'promedio_general_pareja':data[i].promedio_general_pareja,
                                                                               'promedio_ponderado_pareja':data[i].promedio_ponderado_pareja,
                                                                                    'eficiencia_pareja':data[i].eficiencia_pareja,
                                                                                    'mencion_id_pareja':data[i].mencion_id_pareja,
                                                                                    'premio_pareja':data[i].premio_pareja,
                                                                                    'premiodos_pareja':data[i].premiodos_pareja
                                                                                   };
                                         }
					 //send the array of results to bootstrap for display
					 process( nombres );
                                        },
                         });
                },
                matcher: function () { return true; },
                updater: function ( selectedName ) {
                        //save the id value into the hidden field
                        $( "#cedula_pareja" ).val( estudiantes[ selectedName ].cedula );
                        $( "#nombres_pareja" ).val( estudiantes[ selectedName ].nombres_pareja );
                        $( "#apellidos_pareja" ).val( estudiantes[ selectedName ].apellidos_pareja );
                        $( "#correo_pareja" ).val( estudiantes[ selectedName ].correo_pareja );
                        $( "#promedio_general_pareja" ).val( estudiantes[ selectedName ].promedio_general_pareja );
                        $( "#promedio_ponderado_pareja" ).val( estudiantes[ selectedName ].promedio_ponderado_pareja );
                        $( "#eficiencia_pareja" ).val( estudiantes[ selectedName ].eficiencia_pareja );
                        $( "#mencion_id_pareja" ).val( estudiantes[ selectedName ].mencion_id_pareja );
                        $( "#premio_pareja" ).val( estudiantes[ selectedName ].premio_pareja );
                        $( "#premiodos_pareja" ).val( estudiantes[ selectedName ].premiodos_pareja );

                        //return the string you want to go into the textbox (the name)
                        return selectedName;
                        }
                });
  });
