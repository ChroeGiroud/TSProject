/// <tipos de referência = "node" />
importar  {  normalizar ,  relativo  }  do  "caminho" ;
import  assert  = require ( "assert" ) ;
import  {  readFileSync ,  writeFileSync  }  de  "FS" ;

/ **
 * Uma descrição mínima para um objeto package.json analisado.
 * /
interface  PackageJson  {
    nome : string ;
    versão : string ;
    palavras - chave : string [ ] ;
}

function  main ( ) : void  {
    const  args  =  processo . argv . fatia ( 2 ) ;
    if  ( args . comprimento  <  3 )  {
        const  thisProgramName  =  relative ( process . cwd ( ) ,  __filename ) ;
        console . log ( "Uso:" ) ;
        console . log ( `\ tnode $ { thisProgramName } <dev | insiders> <package.json location> <arquivo contendo versão>` ) ;
        retorno ;
    }

     tag  const =  args [ 0 ] ;
    if  ( tag  ! ==  "dev"  &&  tag  ! ==  "insiders"  &&  tag  ! ==  "experimental" )  {
        lançar um  novo  erro ( `nome de tag inesperado ' $ { tag } ' .` ) ;
    }

    // Adquira a versão do arquivo package.json e modifique-a apropriadamente.
    const  packageJsonFilePath  =  normalize ( args [ 1 ] ) ;
    const  packageJsonValue : PackageJson  =  JSON . análise ( readFileSync ( packageJsonFilePath ) . toString ( ) ) ;

    const  { majorMinor , patch }  =  parsePackageJsonVersion ( packageJsonValue . versão ) ;
    const  prereleasePatch  =  getPrereleasePatch ( tag ,  patch ) ;

    // Adquira e modifique o arquivo de origem que expõe a string de versão.
    const  tsFilePath  =  normalize ( args [ 2 ] ) ;
    const  tsFileContents  =  readFileSync ( tsFilePath ) . toString ( ) ;
    const  modifiedTsFileContents  =  updateTsFile ( tsFilePath ,  tsFileContents ,  majorMinor ,  remendo ,  prereleasePatch ) ;

    // Certifique-se de que estamos realmente mudando alguma coisa - o usuário provavelmente deseja saber que a atualização falhou.
    se  ( tsFileContents  ===  modifiedTsFileContents )  {
        let  err  =  `\ n ' $ { tsFilePath } ' não foi atualizado durante a configuração de uma publicação de pré-lançamento para ' $ { tag } '. \ n` ;
        err  + =  `Certifique-se de que você ainda não executou este script; caso contrário, apague suas alterações usando 'git checkout - " $ { tsFilePath } "' .` ;
        lançar  novo  erro ( err  +  "\ n" ) ;
    }

    // Finalmente grava as mudanças no disco.
    // Modifique a estrutura package.json
    packageJsonValue . versão  =  ` $ { majorMinor } . $ { prereleasePatch } ` ;
    writeFileSync ( packageJsonFilePath ,  JSON . stringify ( packageJsonValue ,  / *  replaceer : * / undefined ,  / * space: * /  4 ) ) ;
    writeFileSync ( tsFilePath ,  modifiedTsFileContents ) ;
}

/ * eslint-disable no-null / no-null * /
function  updateTsFile ( tsFilePath : string ,  tsFileContents : string ,  majorMinor : string ,  patch : string ,  nightlyPatch : string ) : string  {
    const  majorMinorRgx  =  / export const versionMajorMinor = " ( \ d + \. \ d + ) " / ;
    const  majorMinorMatch  =  majorMinorRgx . exec ( tsFileContents ) ;
    assert ( majorMinorMatch  ! ==  null ,  `O arquivo ' $ { tsFilePath } ' parece não ter mais uma string correspondente a ' $ { majorMinorRgx } ' .` ) ;
    const  parsedMajorMinor  =  majorMinorMatch ! [ 1 ] ;
    assert ( parsedMajorMinor  ===  majorMinor ,  `versionMajorMinor não corresponde. $ { tsFilePath } : ' $ { parsedMajorMinor } '; package.json: ' $ { majorMinor } '` ) ;

    const  versionRgx  =  / export const version (? :: string ) ? = ` \ $ \ { versionMajorMinor \} \. ( \ d ) ( - \ w + ) ? `; / ;
    const  patchMatch  =  versionRgx . exec ( tsFileContents ) ;
    assert ( patchMatch  ! ==  null ,  `O arquivo ' $ { tsFilePath } ' parece não ter mais uma string correspondente a ' $ { versionRgx . toString ( ) } ' .` ) ;
    const  parsedPatch  =  patchMatch ! [ 1 ] ;
    if  ( parsedPatch  ! ==  patch )  {
        lançar um  novo  erro ( `patch não corresponde. $ { tsFilePath } : ' $ { parsedPatch } ; package.json:' $ { patch } '` ) ;
    }

    return  tsFileContents . substituir ( versionRgx ,  `export const version: string = \` \ $ {versionMajorMinor}. $ { nightlyPatch } \ `;` ) ;
}

função  parsePackageJsonVersion ( versionString : cadeia ) : {  majorMinor : cadeia ,  remendo : cadeia  }  {
    const  versionRgx  =  / ( \ d + \. \ d + ) \. ( \ d + ) ( $ | \ - ) / ;
    const  match  =  versionString . corresponder ( versionRgx ) ;
    assert ( match  ! ==  null ,  "package.json 'version' deve corresponder a"  +  versionRgx . toString ( ) ) ;
    return  {  majorMinor : match ! [ 1 ] ,  patch : match ! [ 2 ]  } ;
}
/ * eslint-enable no-null / no-null * /

/ ** por exemplo, 0-dev.20170707 * /
function  getPrereleasePatch ( tag : string ,  plainPatch : string ) : string  {
    // Vamos acrescentar uma representação da hora atual no final da versão atual.
    // String.prototype.toISOString () retorna uma string de 24 caracteres formatada como 'AAAA-MM-DDTHH: mm: ss.sssZ',
    // mas preferimos apenas remover os separadores e nos limitar a AAAAMMDD.
    // A hora UTC sempre estará implícita aqui.
    const  agora  =  nova  data ( ) ;
    const  timeStr  =  now . toISOString ( ) . substituir ( / : | T | \. | - / g ,  "" ) . fatia ( 0 ,  8 ) ;

    retornar  ` $ { plainPatch } - $ { tag } . $ { timeStr } ` ;
}

main ( ) ;
