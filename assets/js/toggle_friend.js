{
    let toggleFriendship = function(){
        let followlink  = $('#toggle-friendship');
        let followButton  = $('#friend-button');
        followlink.click(function(e){
            console.log('inside toggle friedship');
            e.preventDefault();
            $.ajax({
                type:'POST',
                URL: '/users/addfriend'
            }).done(function(){
                followlink.attr('href','/users/removefriend')
                followButton.html(`Unfollow`);
            })
            .fail(function(errData){
                console.log('error in completing the request');
            })
        })
    }

    let friendShip = function(){
        
    }

    toggleFriendship();
}