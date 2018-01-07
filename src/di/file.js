/**
 * Zemit File Manager
 * @author: <contact@dannycoulombe.com>
 * 
 * Provides tools to drop, preview and upload files.
 */
(function() {
	Zemit.app.factory('$file', [function() {
		
		var namespace = this.name;
		
		var factory = {
			
			toBase64: (file) => {
				
				return new Promise((resolve, reject) => {
					
					var reader = new FileReader();
					reader.onload = function(event) {
					    resolve(event);
					};
					reader.onerror = reject;
					reader.readAsDataURL(file);
				});
			},
			
			base64toFile: (base64, mimeType) => {
				
				var data = base64.split(',')[1];
				return new Blob([window.atob(data)],  {type: mimeType, encoding: 'utf-8'});
			},
			
			getChecksum: (file) => {
				
				return new Promise((resolve, reject) => {
					
					factory.toBase64(file).then((event) => {
						var string = event.target.result;
						
						let index;
					    let checksum = 0x12345678;
					
					    for (index = 0; index < string.length; index++) {
					        checksum += (string.charCodeAt(index) * (index + 1));
					    }
					
					    resolve(checksum);
					});
				});
			},
			
			downloadAs: function(mimeType, fileName, content) {
				
				var data = 'data:' + mimeType + 'charset=utf-8,' + content;
				data = encodeURI(data);
		
				var link = document.createElement('a');
				link.setAttribute('href', data);
				link.setAttribute('download', fileName);
				link.click();
				link.remove();
			},
			
			promptFileDialog: function(callback, accept) {
				
				var input = document.createElement('input');
				input.type = 'file';
				input.accept = accept;
				angular.element('body').append(input);
				input.click();
				
				input.onchange = function(event) {
					
					var files = event.target.files;
					var file = files[0];
					input.remove();
					
					callback(file);
				};
			},
			
			drop: {
				init: function(element, scope, settings) {
				
					var $e = angular.element(element);
					
					var isSupported = function(event) {
						
						if(!settings.supportedTypes
						|| settings.supportedTypes.length === 0) {
							return true;
						}
						
						var files = event.dataTransfer.items;
						for (var i = 0, file; file = files[i]; i++) {
							if(settings.supportedTypes.indexOf(file.type) === -1) {
								return false;
							}
						};
						
						return true;
					};
					
					var parseEvent = function(event, callback) {
						
						var result = [];
						var files = event.target.files || event.dataTransfer.files;
						var completed = 0;
						
						for (var i = 0, file; file = files[i]; i++) {
						
							var reader = new FileReader();
							reader.onload = function(read) {
								completed++;
								result.push(read);
								if(completed === files.length) {
									callback(result);
								}
							};
							reader.readAsDataURL(file);
						};
					};
					
					$e.on('drop.' + namespace, function(event) {
						
						event.preventDefault();
						
						$e.removeClass('zm-file-drop-activate zm-file-drop-invalid');
						
						if(isSupported(event.originalEvent)
						&& settings.onComplete instanceof Function) {
							
							settings.onComplete(event, event.originalEvent.dataTransfer.files);
						}
					});
					
					$e.on('dragover.' + namespace, function(event) {
						
						event.preventDefault();
						
						if(isSupported(event.originalEvent)) {
							event.originalEvent.dataTransfer.dropEffect = "copy";
							$e.addClass('zm-file-drop-activate');
							
							if(settings.onDragOver instanceof Function) {
								return settings.onDragOver(event);
							}
						}
						else {
							event.originalEvent.dataTransfer.dropEffect = "none";
							$e.addClass('zm-file-drop-invalid');
						}
					});
					
					$e.on('dragleave.' + namespace, function(event) {
						
						$e.removeClass('zm-file-drop-activate zm-file-drop-invalid');
						
						if(settings.onDragLeave instanceof Function) {
							return settings.onDragLeave(event);
						}
					});
				}
			}
		};
		
		return factory;
	}]);
})();