{
var propagateMasterProperties = function(){
  var activeItem = app.project.activeItem;
  if(activeItem == null || !(activeItem instanceof CompItem)){
    // if no comp selected, display an alert
    alert("Please establish a comp as the active item and run the script again");
  } else {
    var activeComp = activeItem;
    var selectedLayers = activeComp.selectedLayers;
    var controlsNullLayerName = "CONTROLS";
    var controlsNullLayer = activeComp.layers.byName(controlsNullLayerName);
    if(controlsNullLayer == null){
      controlsNullLayer = activeComp.layers.addNull();
      controlsNullLayer.name = controlsNullLayerName;
    }
    if(!controlsNullLayer.guideLayer){
      controlsNullLayer.guideLayer = true;
    }

    var propertyNames = "MASTER PROPERTIES\n";

    for(var i = 0; i < selectedLayers.length; i++){
      var selectedLayer = selectedLayers[i];
      for(pg = 0; pg < selectedLayer.numProperties ; pg++){
        var propertyGroup = selectedLayer.property(pg+1);
        if(propertyGroup.name == "Master Properties"){
          for(p = 0; p < propertyGroup.numProperties; p++){
            var property = propertyGroup.property(p+1);
            var propertyType = property.propertyValueType;
            propertyNames  += property.name + ": " + property.propertyValueType + "\n";
            if(propertyType == 6424){
              // TEXT property
              var textLayer = activeComp.layers.byName(property.name);
              if(textLayer == null){
                textLayer = activeComp.layers.addText();
                textLayer.text.sourceText.setValue(property.value);
                textLayer.guideLayer = true;
                textLayer.name = property.name;
                textLayer.text.sourceText.addToMotionGraphicsTemplateAs(activeComp, property.name);
                property.expression = 'thisComp.layer("' + textLayer.name + '").text.sourceText';
              }
            } else {
              // other properties
              var control = controlsNullLayer.effect(property.name);
              if(control == null){
                //controlsNullLayer.property("Effects").effect(property.name)
              }
            }
          }
          /*
          if(selectedProperty.canAddToMotionGraphicsTemplate(activeComp)){
            selectedProperty.addToMotionGraphicsTemplateAs(activeComp,selectedProperty.name)
          } */

        }
      }
    }

    //alert(propertyNames);

    controlsNullLayer.moveToBeginning();

  }
}


  app.beginUndoGroup("Propagate Master Properties from Selected Layer");
  propagateMasterProperties();
  app.endUndoGroup();

}
