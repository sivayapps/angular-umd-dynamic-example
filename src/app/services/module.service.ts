import { Observable } from 'rxjs/Observable';
import { ModuleData } from './../models/module.model';
import { Http } from '@angular/http';
import { Injectable, Compiler } from '@angular/core';
import 'rxjs/add/operator/map';

// Needed for the new modules
import * as AngularCore from '@angular/core';
import * as AngularCommon from '@angular/common';
import * as AngularRouter from '@angular/router';
import * as AngularClarity from '@clr/angular';
import * as BrowserAnimations from '@angular/platform-browser/animations';

@Injectable()
export class ModuleService {
    source = `http://${window.location.host}/`; 

    constructor(private compiler: Compiler, private http: Http) { 
    }

    loadModules() : Observable<ModuleData[]> {
        return this.http.get("./assets/modules.json")
                .map(res => res.json());
    }

    loadModule(moduleInfo: ModuleData) : Observable<any> {
        let url = this.source + moduleInfo.location;
        return this.http.get(url)
                .map(res => res.text())
                .map(source => {
                    const exports = {}; // this will hold module exports
                    const modules = {   // this is the list of modules accessible by plugins
                        '@angular/core': AngularCore,
                        '@angular/common': AngularCommon,
                        '@angular/router': AngularRouter,
                        '@angular/platform-browser/animations': BrowserAnimations,
                        '@clr/angular': AngularClarity
                    };
                    
                    // shim 'require' and eval
                    const require: any = (module) => modules[module];      
                    eval(source);

                    // Need to check if there is another solution for eval as this is described as 'Evil'
              
                    this.compiler.compileModuleAndAllComponentsSync(exports[`${moduleInfo.moduleName}`])
                    //console.log(exports); // disabled as this object is cleared anyway
                    return exports;            
                });
    }
}