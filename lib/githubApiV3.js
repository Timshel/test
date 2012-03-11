// ## Client-side Javascript API wrapper for GitHub

// Tries to map one-to-one with the GitHub API V3, but in a Javascripty manner.

( function(globals){
    
    var apiRoot = "https://api.github.com";
    
    jsonp = function(url, context, callback){
        console.log( url );
        $.ajax({
              url: url,
              dataType:  'jsonp',
              context: context,
              success: callback
        });
    };
    
    collaboratorsBuilder = function( context, callback, repo){
        this.context = context;
        this.callback = callback;
        this.repo = repo;
        this.page = 1;
        this.detailed = [];
        this.nbCollaborators = 0;
    }
    
    collaboratorsBuilder.prototype.details = function( response ){
        this.nbCollaborators += response.data.length;
        console.log( response.data.length );
        if( response.data.length === 100 ){
            this.repo.collaborators(this, this.details, ++this.page);
        }
        for( var i = 0; i < response.data.length; i++){
            gh3.userDetails( response.data[i].login, this, this.build )
        } 
    }
    
    collaboratorsBuilder.prototype.build = function ( response ){
        this.detailed[this.detailed.length] = response.data;
        if( this.detailed.length === this.nbCollaborators ){
            this.callback.apply(this.context, [this.detailed]);
        }
    }
    
    // Expose the global `gh` variable, through which every API method is
    // accessed, but keep a local variable around so we can reference it easily.
    gh3 = globals.gh3 = {};

    // This is the base constructor for creating repo objects. Note that this
    // won't actually hit the GitHub API until you specify what data you want,
    // or what action you wish to take via a prototype method.
    gh3.repo = function (user, repo) {
        if(!(this instanceof gh3.repo)){
            return new gh3.repo(user, repo);
        }
        this.repo = repo;
        this.user = user;
    };
    
    gh3.repo.prototype.baseUrl = function(){
        return apiRoot + "/repos/" + this.user + "/"+ this.repo;
    };

    gh3.repo.prototype.collaborators = function( context, callback, pageNumber ){
        if( !pageNumber || pageNumber == 0 ){
            pageNumber = 1;
        }
        jsonp( this.baseUrl() + "/collaborators?page="+Number(pageNumber)+"&per_page=100", context, callback);
        return this;
    };
    
    gh3.repo.prototype.collaboratorsDetailed = function( context, callback ){
        var builder = new collaboratorsBuilder(context, callback);
        this.collaborators( builder, builder.details );
        return this;
    };
    
    gh3.repo.prototype.commits = function( page, perPage, context, callback ){
        jsonp( this.baseUrl() + "/commits?page=" + page + "&per_page=" + perPage, context, callback);
        return this;
    };
    
    gh3.userDetails = function( user, context, callback ){
        jsonp( apiRoot + "/users/" + user, context, callback);
        return this;
    };

}(window));
