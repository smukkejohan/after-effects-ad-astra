{
	var OS = $.os;

	replaceAEPrefrencesFile = function() {
		var folder_from;
		var folder_to;


		// if(OS.indexOf("Macintosh OS") !== -1) {
		// 	folder_from = new Folder("/Volumes/Assets/TEMP_AFTER_EFFECTS/___AE_prefrences_copyPaste/from/");
		// 	folder_to = new Folder("/Volumes/Assets/TEMP_AFTER_EFFECTS/___AE_prefrences_copyPaste/to/");
		// } else {

			folder_from = new Folder("\\\\10.65.6.42\\Assets\\IrsAirlook\\iRS\\");
			folder_to = new Folder("C:\\Users\\itx-user\\AppData\\Roaming\\Adobe\\After Effects\\11.0");
		// }


		var new_prefs_file = findAEPrefrencesFile('Adobe After Effects 11.0-x64 Prefs.txt', folder_from);
		var old_prefs_file = findAEPrefrencesFile('Adobe After Effects 11.0-x64 Prefs.txt', folder_to);

		if(old_prefs_file && new_prefs_file){

			new_prefs_file.copy(old_prefs_file);
			
		} else {
			//alert("NO FILE")
		} 
	}

	  


	findAEPrefrencesFile = function(filenameToFind, folder) {
	   if (folder instanceof Folder && folder.exists) {
		   var files = folder.getFiles('*');
		   for (var i = 0; i < files.length; i++) {
			   if (files[i] instanceof Folder) {
				   var result = findAEPrefrencesFile(filenameToFind, files[i]);
				   if (result != null) {
					   return result;
				   }
			   } else if (files[0] instanceof File && filenameToFind.toLowerCase() == files[i].name.toLowerCase()) {
				   return new File(files[i]);
			   }
		   }
		} else {
			return null;
		}
	}


	replaceAEPrefrencesFile();
}