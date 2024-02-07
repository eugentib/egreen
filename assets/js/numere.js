function sumabani(numar)
{
   cifre=array('','unu','doi','trei','patru','cinci','sase','sapte','opt','noua','zece');
   
   zeci = array('', '', 'douazeci', 'treizeci', 'patruzeci', 'cincizeci', 'saizeci', 'saptezeci', 'optzeci', 'nouazeci');
   
    sute = cifre; sute[1]='o'; sute[2]='doua';
   
    grade=array('','mii','milioane','miliarde');
   
    valori=array(
        10 => 'zece',
      11 => 'unsprezece',
      12 => 'doisprezece',
      13 => 'treisprezece',
      14 => 'patrusprezece',
      15 => 'cincisprezece',
      16 => 'sasesprezece',
      17 => 'saptesprezece',
      18 => 'optsprezece',
      19 => 'nouasprezece'
   );
   numar=trim(numar);
   i=-1;
    /*while(numar{i+1}=='0')
    {
       i++;
    }
    if(i>=-1)
    {
       numar=substr(numar,i+1);
    }*/
   if( isset(valori[numar]) )
    {
       return valori[numar];
    }
   
    /* despartirea in grade  - unitati, mii, milioane, miliarde, etc...*/
    numar=strrev(numar);
    nr=array();
    echo ' ';
    for(i=0,maxi=strlen(numar)-1;i<=maxi;i++)
    {
       //echo '* '.i.' -> '.numar{i}.'<br>';
        rest=i%3;
       if(rest==0)
        {
           nr[i/3]=numar{i};
        } elseif( rest==1 ) {
           nr[round((i-1)/3,0)].=numar{i};
        } elseif( rest==2 ) {
           nr[round((i-2)/3,0)].=numar{i};
        }
       
    }

   
    output='';
    for(i=count(nr)-1; i>=0; i-- )
    {
       /* `curatire` nr[i] */
       nr[i]=strrev(nr[i]);
       while(strlen(nr[i])<=2)
       {
          nr[i]='0'.nr[i];
       }
     
       aregrad=false;
       if(isset(nr[i]{0}) && nr[i]{0}!='0')
       {
          output.=' '.sute[ nr[i]{0} ];
          if(nr[i]{0}>1)
          {
             output.=' sute';
          } elseif(nr[i]{0}==1) {
             output.=' suta';
          }
          aregrad=true;
       }
       
       if(isset(nr[i]{1}) && nr[i]{1}==1) {
          /* 11 <> 19 */
          temp=nr[i]{1}.nr[i]{2};
          if(isset(valori[temp]))
          {
             output.=' '.valori[temp];
             aregrad=true;
          }
       } else {
         
          if(isset(nr[i]{1}) && nr[i]{1}!='0')
          {
             output.=' '.zeci[ nr[i]{1} ];
             aregrad=true;
          }   
         
          if(isset(nr[i]{2}) && nr[i]{2}!='0')
          {
             if(isset(nr[i]{1}) && nr[i]{1}!='0')
             {
                output.=' si';
             }
             output.=' '.cifre[ nr[i]{2} ];
             aregrad=true;
          }
       }
         
          if(aregrad)
          {
            output.=' '.grade[i];   
          }         
    }
   
    function sumabani(numar){
        pos=strpos(numar,'.');
        if (pos===false){
           return int2string(numar);
        } else {
           list(ron,bani)=explode('.',numar);
           litere=int2string(ron).' RON';
           if ( bani!='0' ) litere.=' si '.int2string(bani).' bani';
           return  litere;
        }
     }