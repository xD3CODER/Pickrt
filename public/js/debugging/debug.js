/**
 * Created by xd3vhax on 12/07/16.
 */


function getExecTime(funcname, functoexectute, precision){

  var start = performance.now();

    for (i=0; i<precision; i++){

        functoexectute;
    }


    var stop = performance.now();
    var dif = 100000*(stop-start);
    console.log(funcname+" tool " + dif +"  -> Result= "+functoexectute);


}


function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

// Vitesse d'exec : ripmd, sha1, sha512, sha3 sha224   sha384