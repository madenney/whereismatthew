

const main = function(){
   console.log("data: ", data)
   const addressBox = $('#addressBox')
   const updatedBox = $('#updatedBox')

   if(data.trak4Data.GPS_speed !== 0 ){
      const { trak4Data, googleData } = data;
      const { GPS_speed, GPS_heading } = trak4Data

      console.log(GPS_speed,GPS_heading)
      // add a check for weird GPS errors
      $('#speed').html(GPS_speed > 80 || GPS_speed < -1 ? 70 : GPS_speed)

      let direction = 'N/A'
      const compass =
         ['North','Northeast','East','Southeast',
         'South','Southwest','West','Northwest','North']
      let count = 22.5
      for(var i = 0; i < 9; i++){
         if(GPS_heading < count){
            direction = compass[i]
            break
         } else {
            count += 45
         }
      }
      $('#direction').html(direction)

      let county = googleData.address_components.find(a => {
         return a.types.indexOf('administrative_area_level_2') > -1
      }).long_name

      let state = googleData.address_components.find(a => {
         return a.types.indexOf('administrative_area_level_1') > -1
      }).long_name
      $('#movingLocation').html(`${county}, ${state}`)

   }
}


main();

