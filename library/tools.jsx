{
  var PATH = new File($.fileName).path;

  $.evalFile(PATH+"/../../AirlookFramework/library/utils.jsx");
  $.evalFile(PATH+"/../../AirlookFramework/library/utils_keys.jsx");
  $.evalFile(PATH+"/../../AirlookFramework/library/3d.jsx");

  var makeFootage = function() {
    for(var i=1; i<=10; i++){
      var footageComp = _.getComp("FOOTAGE-1").duplicate();
      footageComp.name = "FOOTAGE-"+(30+i);
      footageComp.layer(1).remove();
      // var footage = _.getItem("{FOOTAGE-1}");
      // footage.name = "{FOOTAGE-"+(30+i)+"}";
      // footage.addToComp(footageComp);
    }
  }

  // same same but different
  var addFootagePlaceholders = function(num)
  for(var i=1; i<=num; i++) {
    var comp = app.project.items.addComp("FOOTAGE-"+i, 1920, 1080, 1, 120, 25);
    var placeholder = app.project.importPlaceholder("{FOOTAGE-"+i+"}", 1920, 1080, 25, 120);
    var layer = comp.layers.add(placeholder);
  }

  app.beginUndoGroup("UNDO TOOLS");
  //addFootagePlaceholders(100);
  app.endUndoGroup();

}
