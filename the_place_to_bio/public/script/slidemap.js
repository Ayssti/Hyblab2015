"use strict";

function SlideMap(app) {
		var mapChart;
		var self = this;
		
		
		this.current_region = null;
		this.current_region_id = null;
		
		//Mise à jour des infos d'apres la carte
		Highcharts.wrap(Highcharts.Point.prototype, 'select', function (proceed) {
			proceed.apply(this, Array.prototype.slice.call(arguments, 1));
			var points = mapChart.getSelectedPoints();
			if (points.length && points.length === 1)
			{
				if(points[0].name) $('#titre_region').html(points[0].name);
				else $('#titre_region').html('N/A');
				
				if(points[0].id) $('#classement_region_selectionnee').html(points[0].id);
				else $('#classement_region_selectionnee').html('N/A');
				
				if(points[0].value) $('#valeur_pourcentage_bio_region_selectionnee').html(points[0].value);
				else $('#valeur_pourcentage_bio_region_selectionnee').html('N/A');
				
				console.log(points[0]);
				self.current_region = points[0].identifier;
				
				if(points[0].nb) self.counter.setValue(points[0].nb);
				else self.counter.setValue(0);
			}
			else
			{
				$('#titre_region').html('N/A');
				this.current_region = null;
				$('#classement_region_selectionnee').html('N/A');
				$('#valeur_pourcentage_bio_region_selectionnee').html('N/A');
			}
		});
		
		this.slider = new Slider(app, $("#slider_slide_carte")[0], {
			onChange: function(id){ self.changeYear(id) }
		});
		this.counter = new Counter(app, $("#compteur_region")[0]);
		
		//Carte
		this.mapChart = mapChart = $('#carte').highcharts('Map', {
			title: {
				text:''
			},
			subTitle: {
				text:''
			},
			legend: {
				enabled: false
			},
			chart: {
				backgroundColor: false,
			},
			credits: {
				enabled: false
			},
			series: [{
				"type": "map",
				"data": this.extendData({}), //data
				dataLabels: {
					enabled: true,
					crop: false,
					style:
					{
						"color": "#FFFFFF",
						"fontSize":"20px",
						"fontWeight": "bold"
					},
					formatter: function()
					{
						if(this.point.id && (this.point.id >= 1 && this.point.id <= 3))
						{
							return this.point.id;
						}
					}
				},
				tooltip: {
					headerFormat: '',
					pointFormat: '{point.name} : {point.value}% bio<br/><div style="font-size: 10px">(Cliquez pour plus de détails)</div>',
				},
				color: "#F3E6D3",
				allowPointSelect: true,
				cursor: 'pointer',
				states: {
					hover: {
						enabled: true,
						brightness: 0
					},
					select: {
						color: false,
						borderColor: '#FF592A',
						borderWidth: 3,
						dashStyle: 'solid'
					}
				},
				borderColor: "#000000"
			}], //series
			colorAxis: {
				type: 'linear',
				minColor: '#F9B330',
				maxColor: '#FF592A'
			}
		}).highcharts();

		
}

SlideMap.prototype = {
	setData: function(data){
		this.data = data;
		this.data.labels = [];
		var l = {
			'surfbio':'hectares',
			'tetesbio':'têtes',
			'ruchesbio':'ruches'
		};
		$("#compteur_type_valeur").html(l[data.data.attributCpt])
		this.current = 0;
		for(var i in this.data.values){
			this.data.labels.push(i);
			this.current = i;
			
			//Classement
			var cls = [];
			for(var j in this.data.values[i]){
				cls.push([j,data.values[i][j].pbio]);
				
			}
			cls.sort(function(a,b){
				if(a[1] == b[1]) return 0;
				if(a[1] > b[1]) return -1;
				return 1;
			})
			for(var j=0;j<cls.length;j++){
				this.data.values[i][cls[j][0]].classement = j+1;
			}
		}
		
		this.slider.setValues(this.data.labels);
		this.slider.setValue(this.data.labels.length-1);
		this.changeYear(this.data.labels.length-1);
	},
	changeYear: function(id){
		this.mapChart.series[0].setData(this.extendData(this.data.values[this.data.labels[id]]));
		this.mapChart.redraw();
		//Preselection de la premiere region
		if(this.current_region == null){
			this.current_region_id = 1;
			this.current_region = this.mapChart.get(1).identifier;
		}
		console.log(this.current_region);
		this.mapChart.get(this.current_region_id).select(true);
	},
	extendData: function(data){
		var retour = [{
						"name": "Poitou-Charentes",
						"path": "M291,141C285,140,280,138,277,134,276,133,274,130,273,127,269,118,268,116,266,114,262,110,258,110,252,113,249,114,249,114,249,113,249,112,246,106,245,105,244,104,241,102,238,99,233,94,231,92,228,86,223,78,221,76,210,71,203,68,201,67,198,64,195,61,192,57,192,55L192,54,197,54C201,54,204,54,209,55,219,57,222,57,226,55,232,52,233,49,229,41,227,38,226,35,225,33,224,30,218,9,218,7,218,6,219,6,223,5,235,1,238,1,250,3,262,5,267,5,270,2,272,-1,272,-3,270,-8,268,-14,267,-17,269,-26,269,-31,270,-35,270,-36,269,-38,267,-40,262,-45,252,-53,242,-64,241,-70,241,-72,242,-74,244,-75,246,-76,251,-75,259,-73,271,-68,273,-68,277,-68,280,-68,282,-69,286,-70,290,-72,291,-72,295,-72,298,-72,301,-72,305,-71,311,-70,318,-69,324,-70L327,-71,330,-67C332,-65,336,-62,339,-60,344,-56,344,-55,345,-53L345,-51,354,-51C364,-52,365,-51,368,-46,371,-42,373,-40,379,-35,384,-31,385,-30,385,-21,386,-12,386,-9,388,-5,389,-1,391,2,394,5L397,8,391,12C387,14,382,17,379,19,374,22,369,27,367,30,365,34,364,37,364,50,365,63,364,65,362,68,361,69,358,72,354,74,343,82,342,84,336,93,333,100,330,103,324,108,315,114,314,117,313,127,312,135,311,138,305,140,303,141,301,142,298,142,295,142,292,142,291,141L291,141z",
						"identifier": "poitou-charentes"
					},
					{
						"name": "Centre",
						"path": "M417,12C410,11,401,8,398,4,393,1,391,-4,389,-9,389,-11,388,-15,388,-19,388,-26,387,-31,386,-32,386,-33,383,-35,381,-37,375,-41,373,-44,370,-48,368,-52,367,-52,365,-53,363,-54,361,-54,355,-54L347,-54,347,-56C346,-57,344,-58,341,-61,331,-69,327,-74,327,-79,327,-81,327,-82,330,-87,331,-90,333,-94,333,-95,334,-95,334,-100,334,-104,335,-114,335,-116,339,-120,343,-124,349,-126,360,-127,368,-128,371,-129,375,-133,382,-141,386,-152,386,-167,386,-177,386,-181,384,-186,383,-187,383,-188,383,-188,383,-188,384,-189,386,-190,391,-192,396,-199,397,-206,398,-210,398,-218,397,-225,396,-228,396,-230,396,-230,396,-230,398,-231,401,-231,406,-233,410,-235,416,-238,419,-240,421,-241,422,-241,425,-241,429,-239,431,-236,431,-235,432,-232,432,-229,434,-220,435,-219,444,-208,449,-202,451,-199,453,-195,459,-183,460,-183,478,-183,491,-182,491,-183,497,-176,501,-171,504,-169,508,-167,514,-164,523,-163,525,-165,526,-165,527,-165,527,-165,527,-165,528,-164,532,-158,533,-156,533,-155,533,-154,533,-153,533,-150,532,-146,530,-138,529,-135,529,-124,529,-114,528,-112,524,-103,521,-94,520,-92,520,-88,520,-82,521,-79,525,-70,527,-66,528,-61,529,-60,530,-56,531,-50,531,-41L531,-31,529,-31C529,-31,525,-30,523,-29,510,-26,505,-21,503,-9,502,0,500,2,493,4,485,7,477,9,457,11,442,12,423,13,417,12L417,12z",
						"identifier": "centre"
					},
					{
						"name": "Limousin",
						"path": "M445,167C443,166,440,165,435,164,432,163,429,164,418,164,411,165,403,166,401,166L397,166,397,163C398,161,398,157,398,154,398,146,396,139,391,134,388,130,388,128,391,121,393,115,394,114,393,110,391,105,389,103,381,100,374,98,372,96,368,91,364,86,359,82,356,80L353,78,357,76C362,72,364,70,366,67,367,63,368,59,367,50,367,40,367,37,369,32,371,29,375,25,379,22,381,21,386,18,391,15L399,9,403,11C410,14,419,15,429,15,435,15,459,13,465,12L467,12,468,17C469,26,471,30,476,37,479,42,482,44,495,50,498,51,499,53,498,57,497,62,493,67,485,71,478,74,477,75,478,80,478,84,479,87,483,92,485,97,486,98,485,102,485,104,485,109,484,112,484,120,484,122,482,125,480,127,477,129,469,132,467,133,465,134,463,136,460,139,460,140,455,150,452,157,449,163,448,164,447,166,447,167,446,167,446,167,446,167,445,167L445,167z",
						"identifier": "limousin"
					},
					{
						"name": "Auvergne",
						"path": "M458,203C455,202,453,201,452,199,450,197,451,193,452,186,454,179,453,176,450,172L449,169,454,158C463,138,464,137,474,133,480,130,483,128,485,124,487,121,487,121,487,112,487,108,488,103,488,102,489,98,488,96,484,89,480,83,479,78,481,76,482,76,484,74,487,73,495,69,500,62,501,56,501,51,500,49,492,45,483,41,478,37,474,29,472,25,471,21,470,15,470,13,470,12,470,12,470,12,474,11,477,11,485,10,494,7,498,5,503,3,504,0,506,-8,506,-13,507,-16,509,-18,512,-23,515,-24,524,-27L531,-29,532,-26C533,-18,536,-13,541,-11,545,-9,549,-9,556,-12,564,-14,566,-14,568,-13,570,-13,570,-12,572,-9,575,-3,575,-3,580,2,586,6,590,11,592,15,594,20,594,24,593,30,591,35,592,37,593,39,595,41,595,41,590,42,586,43,585,43,583,45,578,52,573,72,575,82,576,87,577,90,581,99,585,109,585,110,587,118,588,126,589,128,592,131,595,134,598,135,605,134,613,134,617,134,620,135,627,138,632,151,630,157,629,158,627,161,624,164,621,167,618,171,616,174,610,181,606,184,599,187,590,189,585,189,577,185,571,182,568,182,565,184,562,185,561,186,559,189,557,192,556,192,554,191,553,191,552,189,551,186,545,175,539,174,531,183,527,186,517,199,515,201L514,203,514,201C513,200,512,197,511,194,510,191,508,187,507,185,504,181,500,178,496,178,492,178,491,179,486,189,484,193,482,198,481,198,477,202,465,205,458,203L458,203z",
						"identifier": "auvergne"
					},
					{
						"name": "Rhône-Alpes",
						"path": "M690,262C674,260,671,259,672,252,673,248,673,247,669,246,666,244,661,244,655,245,650,245,646,245,646,244,646,243,644,242,642,241,639,239,635,239,626,239,615,239,613,239,609,236,607,235,603,233,600,233,595,232,594,230,594,223,594,218,592,213,588,205,585,199,583,193,583,192,583,191,585,191,589,191,600,191,608,186,621,171,634,157,635,154,630,143,626,134,622,132,609,132,601,132,596,131,595,130,593,129,591,123,588,115,586,108,583,98,581,93,579,87,578,82,578,75,578,65,582,50,585,47,589,44,596,42,603,42,607,42,612,40,619,37,633,31,636,30,645,35,648,36,653,38,654,38,657,38,660,31,662,21,663,16,664,12,665,12,665,11,670,12,675,13,680,14,685,15,688,15,692,15,692,16,690,21,687,26,687,31,690,33,693,35,697,35,705,35,720,35,732,32,749,25,761,19,761,19,761,33,761,39,762,41,763,41,766,41,772,35,776,28,780,20,788,15,799,15,806,15,807,15,810,18,814,23,814,26,811,40,809,50,809,50,813,62,816,73,816,74,814,78,811,83,812,87,819,103,826,121,829,133,829,141,829,150,827,153,819,158,815,160,811,163,808,164,805,168,804,168,795,167,782,166,766,168,764,172,760,176,762,180,768,183,771,184,773,186,773,188,773,190,772,191,758,191,742,191,732,193,725,198,720,201,718,205,722,210,726,217,724,220,713,222,706,223,701,227,701,232,701,235,703,238,710,244,720,253,722,257,717,261,715,263,712,263,690,262z",
						"identifier": "rhone-alpes"
					},
					{
						"name": "Bourgogne",
						"path": "M596,37C594,36,594,34,595,32,598,20,593,9,582,0,579,-3,575,-7,574,-10,570,-17,567,-17,556,-14,550,-12,547,-12,544,-13,537,-15,535,-20,534,-40,533,-56,532,-59,528,-70,525,-77,523,-85,523,-87,523,-90,525,-97,527,-102,530,-110,531,-116,532,-126,532,-133,533,-143,534,-147,536,-155,536,-155,533,-161,531,-164,530,-167,530,-168,530,-168,532,-171,535,-174,539,-179,540,-180,548,-181,553,-181,558,-182,559,-183,563,-185,574,-178,574,-173,574,-169,576,-166,581,-165,584,-164,585,-162,587,-157,589,-153,591,-149,592,-148,595,-145,621,-134,626,-134,629,-134,635,-136,640,-139,651,-144,658,-145,663,-142,664,-141,668,-136,671,-128,674,-122,677,-115,678,-113,682,-108,693,-104,702,-104,711,-103,711,-102,708,-85,706,-72,705,-70,698,-60,695,-57,692,-51,692,-48,691,-45,689,-42,688,-41,684,-38,686,-33,693,-27,705,-17,705,-16,693,-17,688,-18,683,-18,683,-17,683,-17,685,-13,687,-8,690,-4,692,3,692,6,692,12,692,12,688,12,685,13,679,12,674,10,662,8,662,8,659,21,658,29,656,35,654,35,653,35,650,34,647,33,637,28,631,29,619,35,607,40,599,41,596,37L596,37z",
						"identifier": "bourgogne"
					},
					{
						"name": "Franche-Comté",
						"path": "M692,31C690,29,690,25,692,20,696,14,695,2,691,-7,689,-11,688,-15,687,-15,674,-15,691,-15,696,-15,703,-15,704,-15,705,-18,705,-20,703,-22,697,-28,689,-35,688,-37,691,-39,692,-40,693,-44,694,-47,695,-50,698,-56,702,-61,708,-70,709,-74,712,-89,713,-96,713,-100,712,-102,710,-106,712,-107,722,-107,730,-107,730,-106,729,-119,729,-129,732,-134,740,-135,743,-136,748,-136,751,-137,754,-137,758,-137,762,-135,767,-133,772,-132,779,-132,785,-132,790,-131,795,-129,799,-128,803,-126,804,-126,808,-124,820,-108,824,-99,828,-90,829,-87,826,-88,823,-89,819,-87,817,-82,816,-79,814,-77,813,-77,809,-77,812,-75,817,-73,820,-72,823,-70,823,-69,823,-67,817,-62,809,-57,805,-54,799,-48,795,-44,791,-39,784,-30,778,-24,767,-12,763,-3,762,6,761,10,760,14,760,15,758,18,739,27,726,30,716,33,694,34,692,31z",
						"identifier": "franche-comte"
					},
					{
						"name": "Lorraine",
						"path": "M796,-131C791,-134,786,-135,779,-135,772,-135,767,-136,762,-138,758,-139,754,-140,751,-140,749,-139,745,-138,741,-138,736,-137,736,-137,736,-141,736,-143,734,-146,732,-149,728,-153,728,-155,728,-162,728,-171,725,-176,718,-181,714,-183,712,-187,709,-193,705,-201,703,-203,694,-210,688,-215,682,-220,681,-222,679,-225,679,-226,681,-230,685,-237,685,-245,680,-254,677,-258,675,-263,675,-265,675,-275,690,-297,699,-299,705,-301,707,-305,706,-312L705,-318,715,-318C723,-318,726,-317,735,-313,741,-311,750,-308,755,-307,760,-305,767,-303,771,-300,775,-298,782,-294,787,-293,797,-291,801,-287,808,-278,812,-271,818,-269,835,-267,848,-266,850,-266,855,-263,861,-258,861,-258,859,-253,854,-242,846,-240,832,-248,828,-251,823,-254,823,-254,822,-254,820,-253,818,-251,815,-249,815,-247,815,-240,815,-227,817,-225,829,-224,838,-224,838,-224,839,-220,839,-214,838,-211,831,-202,825,-194,824,-191,828,-181L830,-175,823,-163C816,-151,815,-148,811,-136,809,-127,808,-126,796,-131z",
						"identifier": "lorraine"
					},
					{
						"name": "Alsace",
						"path": "M831,-89C828,-98,824,-106,816,-116,811,-123,810,-125,811,-127,812,-128,813,-133,815,-138,816,-143,820,-152,823,-157,833,-176,833,-174,830,-181,827,-190,828,-194,833,-200,839,-207,841,-213,841,-219,841,-226,840,-227,829,-227,819,-227,818,-228,817,-236,817,-245,817,-248,820,-250,822,-251,824,-250,832,-246,846,-237,856,-239,860,-251,862,-256,864,-256,868,-253,869,-252,873,-252,883,-252,896,-253,903,-251,906,-246,908,-242,906,-237,902,-234,892,-228,883,-211,873,-178,866,-154,865,-150,864,-134,863,-121,863,-115,860,-110,859,-106,857,-101,856,-98,856,-93,854,-92,849,-89,846,-87,841,-85,838,-84L832,-83,831,-89,831,-89z",
						"identifier": "alsace"
					},
					{
						"name": "Champagne-Ardenne",
						"path": "M693,-107C683,-110,681,-113,675,-125,667,-142,667,-143,663,-145,657,-148,650,-147,638,-141,627,-136,627,-136,622,-138,595,-147,592,-149,590,-158,588,-165,586,-167,583,-167,579,-167,576,-169,576,-174,576,-176,575,-178,571,-181,566,-185,565,-186,565,-190,565,-192,565,-197,564,-199,561,-205,562,-205,567,-212,573,-220,573,-222,566,-238,563,-246,561,-253,561,-254,561,-254,562,-253,563,-251,566,-246,571,-240,574,-240,579,-240,581,-244,580,-252,579,-260,580,-262,586,-263,590,-264,590,-264,590,-269,590,-271,590,-275,589,-277,588,-280,588,-280,596,-282,613,-285,617,-288,619,-301,620,-306,623,-314,625,-319,629,-326,630,-330,632,-340,634,-359,633,-358,641,-357,648,-357,649,-357,657,-364,667,-371,669,-371,674,-368,677,-366,679,-361,680,-350,682,-335,690,-322,699,-320,701,-319,702,-318,703,-315,704,-307,703,-304,697,-301,691,-298,681,-286,676,-276,672,-267,672,-261,678,-252,682,-245,683,-236,679,-231,674,-226,677,-219,690,-210,701,-201,704,-198,708,-190,709,-186,711,-183,711,-183,712,-183,715,-180,719,-177,725,-171,725,-171,725,-163,725,-155,726,-153,729,-149,734,-142,734,-140,730,-132,727,-126,726,-124,727,-117L728,-109,721,-109C718,-109,712,-108,708,-107,701,-105,701,-105,693,-107L693,-107z",
						"identifier": "champagne-ardenne"
					},
					{
						"name": "Picardie",
						"path": "M566,-251C563,-256,560,-261,558,-263,554,-267,548,-267,547,-263,546,-260,547,-260,523,-264,510,-266,502,-268,497,-271,490,-274,489,-275,473,-275,446,-275,449,-274,449,-284,449,-288,450,-295,451,-298,453,-303,453,-304,452,-308,450,-314,450,-318,452,-321,455,-324,454,-340,450,-351,448,-358,447,-364,447,-370,447,-376,446,-381,444,-384,442,-388,442,-389,444,-399L447,-410,455,-402C463,-394,464,-393,472,-392,477,-391,483,-388,489,-385,496,-380,500,-379,505,-379,511,-378,513,-377,516,-374,519,-372,523,-370,530,-368,535,-366,548,-362,558,-359,575,-354,576,-354,596,-354,609,-354,618,-353,623,-352L630,-350,629,-340C629,-333,627,-328,623,-320,620,-314,617,-306,617,-301,615,-291,612,-288,602,-286,587,-283,585,-282,586,-278,589,-266,589,-266,585,-265,578,-264,577,-260,577,-251,578,-243,578,-243,575,-243,572,-243,570,-245,566,-251L566,-251z",
						"identifier": "picardie"
					},
					{
						"name": "Île-de-France",
						"path": "M511,-168C509,-169,504,-173,501,-176,492,-184,489,-186,475,-186,469,-186,464,-186,462,-187,461,-188,457,-193,454,-198,451,-203,446,-210,442,-215,438,-221,436,-225,435,-229,434,-233,433,-237,430,-240L427,-244,430,-252C433,-258,436,-262,441,-266L449,-272,468,-272C487,-273,488,-272,496,-268,502,-265,510,-263,524,-261,544,-258,550,-258,550,-261,550,-265,552,-262,557,-251,565,-236,570,-223,569,-220,568,-219,566,-215,564,-213,560,-208,559,-205,562,-198,563,-193,563,-192,561,-189,559,-186,556,-185,549,-183,538,-182,536,-180,530,-173,526,-168,525,-167,520,-167,518,-167,514,-168,511,-168z",
						"identifier": "ile-de-france"
					},
					{
						"name": "Nord-Pas-de-Calais",
						"path": "M621,-355C617,-356,611,-357,598,-356,579,-355,581,-355,541,-367,524,-372,520,-373,518,-377,515,-380,513,-381,506,-381,500,-382,497,-383,491,-387,486,-390,480,-392,474,-394,464,-396,460,-399,453,-408,448,-414,448,-415,448,-423,449,-433,455,-443,462,-449,470,-455,491,-465,501,-467,505,-467,513,-468,518,-468,528,-468,528,-468,542,-459,559,-448,564,-443,572,-427,579,-412,584,-407,600,-396,616,-385,619,-382,625,-372,628,-366,630,-362,630,-358,630,-352,629,-352,621,-355L621,-355z",
						"identifier": "nord-pas-de-calais"
					},
					{
						"name": "Haute-Normandie",
						"path": "M395,-236C393,-244,388,-252,381,-255,371,-261,371,-262,370,-278,369,-290,368,-297,364,-308,364,-311,364,-311,368,-313,371,-313,376,-314,379,-314,388,-314,383,-317,367,-322,357,-325,354,-326,354,-328,354,-330,375,-346,384,-352,386,-353,394,-355,401,-357,419,-361,430,-367,437,-379,439,-383,441,-385,442,-384,442,-383,443,-377,444,-370,445,-363,447,-353,448,-347,452,-336,453,-327,450,-322,448,-318,447,-314,449,-308,451,-304,451,-303,449,-298,447,-294,447,-288,447,-282L447,-273,440,-268C434,-264,432,-261,429,-254,425,-245,425,-245,414,-240,409,-237,402,-234,400,-234,396,-233,396,-233,395,-236L395,-236z",
						"identifier": "haute-normandie"
					},
					{
						"name": "Basse-Normandie",
						"path": "M372,-193C370,-194,366,-198,363,-202,356,-212,352,-214,340,-213,333,-212,333,-212,330,-216,319,-229,314,-231,302,-228,288,-224,286,-224,280,-228,273,-231,267,-232,263,-230,261,-229,260,-229,258,-230,257,-231,253,-231,248,-231L239,-230,238,-235C237,-238,237,-240,238,-240,240,-240,239,-246,236,-252,230,-262,228,-269,227,-295,226,-317,225,-320,222,-331,214,-352,217,-356,232,-352,241,-350,241,-350,247,-353,250,-355,254,-357,255,-357,259,-359,264,-353,269,-342,276,-321,280,-317,292,-312,309,-304,330,-302,348,-307,354,-309,359,-310,360,-310,363,-309,368,-286,368,-275,368,-263,370,-259,377,-255,389,-249,390,-246,394,-227,397,-209,396,-203,389,-196,383,-190,378,-189,372,-193L372,-193z",
						"identifier": "basse-normandie"
					},
					{
						"name": "Pays de la Loire",
						"path": "M213,-2C210,-5,205,-10,199,-14,186,-23,182,-28,179,-40,177,-45,174,-54,171,-58,167,-67,167,-70,172,-70,175,-70,176,-76,174,-86,171,-96,172,-98,181,-99,185,-99,186,-100,187,-102,188,-109,181,-111,167,-107,157,-105,150,-105,148,-107,146,-109,147,-110,150,-114,153,-116,155,-119,155,-119,155,-120,157,-122,159,-122,162,-123,166,-127,169,-130,177,-140,181,-143,187,-145,190,-146,196,-149,201,-151,209,-155,209,-155,226,-155L242,-155,243,-160C245,-166,247,-168,254,-171,257,-173,261,-176,262,-178,265,-181,265,-181,261,-191L257,-200,261,-209C263,-215,264,-220,263,-222,262,-229,269,-230,279,-225,286,-221,288,-221,299,-224,312,-228,315,-227,325,-217L333,-209,341,-210C352,-211,354,-210,361,-200,366,-193,368,-191,374,-189,382,-187,383,-183,384,-169,384,-153,377,-136,370,-132,368,-131,362,-130,356,-129,338,-126,333,-121,331,-104,331,-98,329,-92,327,-88,326,-84,325,-80,325,-78,325,-73,325,-73,321,-72,318,-72,312,-72,308,-73,299,-75,291,-74,282,-72,276,-70,274,-70,264,-73,248,-78,246,-79,242,-77,240,-76,239,-74,239,-71,239,-65,243,-59,256,-47L266,-36,267,-23C267,-16,267,-7,268,-5,269,0,269,0,265,1,263,2,258,2,253,1,241,-1,234,-1,224,2L216,4,213,-2,213,-2z",
						"identifier": "pays-de-la-loire"
					},
					{
						"name": "Bretagne",
						"path": "M151,-126C149,-127,144,-129,140,-129,133,-130,132,-130,131,-133,130,-135,127,-138,125,-140,121,-145,119,-144,117,-134,116,-128,115,-127,113,-127,110,-127,108,-130,106,-139,103,-147,99,-152,92,-156,90,-157,83,-161,77,-166,63,-175,53,-180,45,-181,40,-182,40,-182,37,-175,36,-171,33,-168,32,-168,29,-168,24,-173,18,-183,15,-188,10,-194,7,-198,1,-208,2,-209,18,-208,27,-207,31,-207,31,-208,31,-212,29,-214,23,-217,6,-225,6,-230,23,-227,35,-225,38,-226,35,-233,32,-237,28,-239,19,-239,6,-239,0,-244,6,-250,7,-252,9,-255,10,-256,12,-261,34,-271,43,-272,47,-272,56,-271,64,-270,80,-267,83,-268,98,-272,102,-273,108,-274,110,-274,112,-274,118,-276,123,-279,132,-283,136,-284,136,-280,136,-276,148,-254,153,-249,158,-244,163,-243,170,-247,174,-250,174,-250,178,-248,181,-246,200,-240,204,-240,205,-240,206,-242,206,-243,206,-248,209,-248,215,-242,221,-238,222,-237,228,-238L235,-239,236,-233,237,-228,245,-228C256,-229,258,-228,260,-224,262,-220,261,-219,258,-210L255,-201,258,-193C259,-188,261,-184,261,-183,262,-180,256,-174,251,-173,246,-172,242,-167,241,-161L240,-157,225,-158C210,-158,209,-158,202,-154,198,-152,191,-149,187,-148,181,-146,178,-143,169,-135,159,-124,156,-122,151,-126L151,-126z",
						"identifier": "bretagne"
					},
					{
						"name": "Aquitaine",
						"path": "M245,375C243,373,236,372,229,372,222,371,215,370,214,369,212,368,205,362,200,356,190,346,188,345,182,343,176,342,174,341,168,334,164,329,158,324,153,321,143,316,140,313,143,309,145,305,151,300,161,295,166,293,171,290,173,288,178,283,182,273,187,256,192,242,192,237,194,218,195,189,199,178,209,174L213,173,211,156C207,133,208,124,213,114,216,110,218,103,219,99L220,92,223,98C225,101,230,106,234,108,241,112,243,117,245,128,246,135,250,144,252,146,254,147,254,133,252,124L250,117,255,115C259,113,260,113,263,115,264,116,268,121,270,127,276,139,281,143,295,144,303,144,305,144,309,141,313,138,314,136,316,123,317,118,318,116,330,105,333,103,337,98,339,94,341,90,345,85,347,84,350,81,350,81,354,82,356,83,361,87,364,91,368,96,372,99,379,102,390,107,392,110,389,118,386,126,386,131,389,136,400,148,396,170,382,186,374,196,372,199,370,209,369,220,366,225,360,228,355,230,353,234,355,241,357,247,356,251,351,254,348,256,343,257,296,260,265,263,265,263,262,283,260,298,261,306,265,306,269,306,275,310,277,314,280,319,280,325,276,330,274,333,270,339,268,344,265,349,260,356,257,359,252,363,251,365,251,370,251,374,250,377,250,377,249,377,247,376,245,375L245,375z",
						"identifier": "aquitaine"
					},
					{
						"name": "Midi-Pyrénées",
						"path": "M403,423C401,421,395,416,389,413,383,410,372,403,364,399,342,385,331,383,313,392,305,396,303,396,289,396,276,396,274,396,268,393,264,391,259,387,256,384,253,379,252,378,253,372,253,367,254,365,259,360,263,356,267,350,269,347,271,343,274,337,277,333,285,321,283,311,270,305,264,302,263,301,263,297,263,291,266,275,267,271,269,266,273,264,294,263,336,260,348,259,352,257,357,254,360,247,358,241,356,234,357,232,362,230,368,227,371,222,372,213,374,202,375,198,382,190,386,185,391,179,393,175L396,168,417,167C436,166,438,166,442,169,450,173,451,177,449,188,448,196,448,198,450,201,453,206,461,208,470,205,481,203,483,201,488,191,490,186,493,182,495,181,499,179,505,185,508,194,510,199,513,206,515,211,517,216,520,224,521,229,523,240,526,247,536,262,540,269,542,273,542,277,542,285,538,287,524,289L514,290,513,295C512,298,511,301,511,302,509,305,501,307,492,307L484,307,484,321C484,332,484,334,482,335,481,335,474,335,467,334,456,333,450,332,438,334,415,336,411,338,409,349,409,355,409,355,416,363,421,369,422,371,422,375,422,380,421,382,416,387,413,391,410,395,410,396,410,400,415,402,421,402,426,402,429,402,430,404,432,406,432,407,428,412,425,416,411,427,408,428,407,428,405,426,403,423z",
						"identifier": "midi-pyrenees",
					},
					{
						"name": "Languedoc-Roussillon",
						"path": "M429,445C423,443,417,440,413,435L409,430,415,427C422,422,430,415,433,410,434,406,434,406,433,403,431,400,429,400,422,400,412,400,411,398,419,388,424,382,425,380,425,376,425,370,421,363,415,357,413,356,412,353,412,350,412,341,415,339,436,337,450,335,455,335,474,337,485,339,487,337,487,322L487,310,492,310C506,310,515,305,515,296,515,293,515,293,521,292,534,290,536,290,540,286,545,282,546,274,541,266,530,247,525,238,523,229,522,224,520,217,519,213,515,205,515,205,526,192,538,178,541,177,548,187,554,195,555,195,561,190,564,187,568,185,569,185,574,185,580,190,581,194,582,196,584,202,587,207,590,213,591,218,591,222,591,230,593,235,597,235,599,235,604,237,608,239,615,243,616,243,627,242,642,241,644,243,646,254,647,258,648,263,649,266,653,272,651,282,646,289,644,292,640,298,637,302,630,312,628,315,619,319,615,322,612,325,612,326,611,328,610,329,606,329,596,329,581,333,568,339,560,343,551,346,547,347,542,348,537,350,534,352,528,355,520,366,517,374,514,383,514,412,517,417,522,426,523,429,522,432,520,437,513,438,497,438,486,438,479,439,466,442,450,446,436,447,429,445L429,445z",
						"identifier": "languedoc-roussillon",
					},
					{
						"name": "Provence-Alpes-Côte d'Azur",
						"path": "M750,379C750,378,741,377,731,377L712,376,708,370C706,366,703,364,700,363,696,362,695,360,694,359,694,355,688,349,682,347,680,347,671,346,662,346L646,346,629,337,612,329,616,326C617,324,622,321,625,319,629,316,633,313,636,307,639,303,643,297,646,294,654,283,656,274,651,263,650,260,649,256,648,253L648,248,656,247C669,246,670,247,670,254,669,259,670,260,673,261,678,264,709,266,715,265,719,264,722,260,722,255,722,252,721,250,715,246,707,239,704,235,704,231,704,228,705,227,716,224,726,222,728,218,724,210,721,204,722,202,731,197,737,194,740,194,754,194,775,193,776,193,776,188,775,185,774,183,771,181,764,178,763,175,767,173,770,170,791,168,798,170,802,170,802,171,802,174,801,179,805,185,812,190,820,196,822,201,818,211,813,221,814,230,819,240,823,250,829,257,837,261,841,263,845,264,856,264,869,264,870,264,873,268,881,277,873,290,849,307,832,319,826,325,816,342,811,350,806,357,804,358,802,360,795,362,787,364,777,367,772,369,766,373,759,378,752,381,750,379L750,379z",
						"identifier": "provence-alpes-cote-d-azur",
					},
					{
						"name": "Corse",
						"path": "M875,520C872,515,863,511,856,509,851,509,850,508,850,505,851,502,851,499,852,496,852,493,852,492,849,489,846,486,845,484,844,474,843,461,840,455,836,453,833,451,833,447,837,440,838,437,841,432,842,429,843,426,845,422,847,421,851,418,862,414,872,412,881,409,882,407,884,394,884,387,885,382,887,380,889,378,890,378,891,379,892,382,892,382,893,398,893,408,894,411,897,417,900,424,901,427,901,437,901,448,901,449,895,460,889,472,889,473,888,488,888,503,887,504,883,511,880,516,878,520,877,521,877,522,876,522,875,520L875,520z",
						"identifier": "corse",
					}];
		for(var i=0;i<retour.length;i++){
			var id = retour[i].identifier;
			var obj = data[id];
			if(obj){
				if(obj.pbio) retour[i].value = obj.pbio*1;
				if(obj[this.data.data.attributCpt]) retour[i].nb = obj[this.data.data.attributCpt];
				if(obj.classement) retour[i].id = obj.classement*1;
				else retour[i].id = "N/A"
				
				if(this.current_region != null){
					if(this.current_region == retour[i].identifier){
						this.current_region_id = retour[i].id;
						console.log(retour[i]);
					}
				}
			}
		}
		return retour;
	}
}