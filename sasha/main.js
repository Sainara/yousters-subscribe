String.prototype.trim=function(){return this.replace(/^\s*/,"").replace(/\s*$/,"");}
var RecaptchaOptions={theme:'white'};function htmlEntityDecode(str){var ta=document.createElement("textarea");ta.innerHTML=str.replace(/</g,"&lt;").replace(/>/g,"&gt;");return ta.value;}
function getCheckedValue(radioObj){if(!radioObj)
return "";var radioLength=radioObj.length;if(radioLength==undefined)
if(radioObj.checked)
return radioObj.value;else
return "";for(var i=0;i<radioLength;i++){if(radioObj[i].checked){return radioObj[i].value;}}
return "";}
function setCheckedValue(radioObj,newValue){if(!radioObj)
return;var radioLength=radioObj.length;if(radioLength==undefined){radioObj.checked=(radioObj.value==newValue.toString());return;}
for(var i=0;i<radioLength;i++){radioObj[i].checked=false;if(radioObj[i].value==newValue.toString()){radioObj[i].checked=true;}}}
function openPopup(url){popupWin=window.open(url,'target01_window','status,scrollbars,resizable,dependent,width=500,height=600')}
function setReload(obj){var newUrl;newUrl=location.protocol+"//"+location.host;if(location.port!=""){newUrl=newURL+":"+location.port;}
newUrl=newUrl+location.pathname;if(location.hash!=""){newUrl=newURL+":"+location.hash;}
if(obj.value!=""){newUrl=newUrl+"?reload="+obj.value;}
location.replace(newUrl);}
function pad(number,length){var str=''+number;while(str.length<length)
str='0'+str;return str;}
function trimString(s){return s.replace(/\s+/g,"").replace(/,/g,"");}
function Comma(SS){var T="",S=String(SS),L=S.length-1,C,j;for(j=0;j<=L;j++){T+=(C=S.charAt(j));if((j<L)&&((L-j)%3==0)&&(C!="-")){T+=",";}}
return T;}
function asMoney(d,s)
{if(isNaN(d)){return("unknown");}else{var parts=d.toFixed(2).split(".");return((parts[0]<0?"-":"")+s+Comma(Math.abs(parts[0]))+"."+parts[1]);}}
function handleEnter(field,event){var keyCode=event.keyCode?event.keyCode:event.which?event.which:event.charCode;if(keyCode==13){var i;for(i=0;i<field.form.elements.length;i++)
if(field==field.form.elements[i])
break;i=(i+1)%field.form.elements.length;field.form.elements[i].focus();return false;}else return true;}
function updateGeneratorForm(){var myrnd=document.getElementsByName("rnd");if(myrnd.length!=3){alert("Problem: myrnd.length was "+myrnd.length+", not 3");}
var mydate=document.getElementById("date");var myid=document.getElementById("id");if(myrnd[0].checked){mydate.disabled=true;myid.disabled=true;}else if(myrnd[1].checked){mydate.disabled=false;myid.disabled=true;}else if(myrnd[2].checked){mydate.disabled=true;myid.disabled=false;}}
function submitGeneratorForm(){var myrnd0=document.getElementsByName("rnd")[0];var myrnd1=document.getElementsByName("rnd")[1];var myrnd2=document.getElementsByName("rnd")[2];var mydate=document.getElementById("date");var myid=document.getElementById("id");myrnd0.value="new";myrnd1.value="date."+mydate.options[mydate.selectedIndex].value.trim();myrnd2.value="id."+myid.value.trim();}
function createCookie(name,value,path,days){if(!path)path='/';if(days){var date=new Date();date.setTime(date.getTime()+(days*24*60*60*1000));var expires="; expires="+date.toGMTString();}
else var expires="";document.cookie=name+"="+encodeURIComponent(value)+expires+"; path="+path;}
function readCookie(name){var nameEQ=name+"=";var ca=document.cookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' ')c=c.substring(1,c.length);if(c.indexOf(nameEQ)==0)return decodeURIComponent(c.substring(nameEQ.length,c.length));}
return null;}
function eraseCookie(name,path){createCookie(name,"",path,-1);}



var xmlHttp,begin;function getTrueRandomInteger(min, max){
xmlHttp=GetXmlHttpObject()
if(xmlHttp==null){return;}
min=parseInt(min);
max=parseInt(max);
if(isNaN(min))min=1;
if(isNaN(max))max=100;
if(max<=min)max=min+1;
var url;url="https://www.random.org/integers/?num=1&min="+min+"&max="+max+"&col=1&base=10&format=plain&rnd=new";
begin=new Date().getTime();
document.getElementById("true-random-integer-generator-result").innerHTML='<img src="https://www.random.org/util/cp/images/ajax-loader.gif" alt="Loading..." />';
xmlHttp.open("GET",url,true);
xmlHttp.onreadystatechange=updateTrngDisplayAjax;xmlHttp.send(null);
}
function updateTrngDisplayAjax(){
  if(xmlHttp.readyState<4){
    document.getElementById("true-random-integer-generator-result").innerHTML='<img src="https://www.random.org/util/cp/images/ajax-loader.gif" alt="Loading..." />';
  }
if(xmlHttp.readyState==4){
  var waitremain=600-(new Date().getTime()-begin);
  if(waitremain>0){
    setTimeout(printNumber,waitremain);
  }else{
    printNumber();
  }
}
}
var cliclCount = 0
var arr = [22947, 12738, 13554]
function printNumber(){
  var trngresponse=xmlHttp.responseText;

  // document.getElementById("true-random-integer-generator-result").innerHTML=trngresponse;
  // }
  document.getElementById("true-random-integer-generator-result").innerHTML=arr[cliclCount];
  cliclCount++;
  console.log(cliclCount);
}
function GetXmlHttpObject(){
  var xmlHttp=null;
  try{
    xmlHttp=new XMLHttpRequest();
  }catch(e){
    try{xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
  }catch(e){xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");}}
return xmlHttp;
}
function integerJsInputControl(keyp){var unicode=keyp.charCode?keyp.charCode:keyp.keyCode;if(unicode==13){getTrueRandomInteger(document.getElementById('true-random-integer-generator-min').value,document.getElementById('true-random-integer-generator-max').value);return true;}
if(unicode!=8&&unicode!=9&&unicode!=45){if(unicode<48||unicode>57){return false;}else{return true;}}}
