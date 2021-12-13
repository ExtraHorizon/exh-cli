import {Schema, Validator} from 'jsonschema';

export function extractOptions(options: string[],knownOptions:KnownOption[]) {
    const structoptions = options.map(o=>{
        if(!o.startsWith('--')) throw new Error(`unknown option: ${o}`);
        const opt = o.split(/=(.+)/);
        const name = opt[0].slice(2);
        let value:any = opt[1]

        const ko = knownOptions.find(o=>o.name==name);
        if(!ko) throw new Error(`unknown parameter: ${o}`);

        if(ko.schema){
            if(!value) throw new Error(`a value is expected for option: ${name}`);
            if(/^[0-9]+$/.test(value)) value = Number.parseFloat(value);
            if(/^(true|false)$/.test(value)) value = (value=='true') ? true : false;
            const v = new Validator();
            const validationResult = v.validate(value,ko.schema);
            if(validationResult.errors.length!=0) throw new Error(`${name} ${validationResult.errors}. Current value: ${value}`);
        }
        else{
            if(value) throw new Error(`option: ${name} doesn't take any values`);
        }

        return {name,value}
    });

    const missingOptions:string[]=[]
    knownOptions.filter(kp=>kp.required==true).forEach(rp=>{
        if(!structoptions.find(sp=>sp.name==rp.name)) missingOptions.push(rp.name);
    });
    if(missingOptions.length!=0) throw new Error(`missing required options: ${missingOptions}`);

    //reduce double values
    const reducedoptions =  structoptions.reduce<ReducedOption[]>((r,v)=>{
        const existingOption = r.find(eo=>eo.name==v.name);
        if(existingOption){
            existingOption.value.push(v.value);
        }
        else{
            r.push({name:v.name,value:[v.value]});
        }
        return r;
    },[]);

    return reducedoptions;
}

interface KnownOption {
    name:string,
    required:boolean,
    schema?:Schema
}

interface ReducedOption {
    name:string,
    value:any[]
}