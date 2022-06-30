
function calcMinutes(start, finish) {
   const optionsDate = {year: 'numeric', month: 'long', day: 'numeric' };
   const minuts = ((new Date(finish)).getTime() - (new Date(start)).getTime())/60000

   if(minuts < 60){
      const minutes = Math.floor(minuts%60)

      if(minutes === 1 || (minutes > 19 && minutes % 10 == 1)){
         return `${minutes} минуту назад`
      }
      else if((minutes > 1 && minutes < 5) || (minutes > 19 && minutes % 10 > 1 && minutes % 10 < 5)){
         return `${minutes} минуты назад`
      }
      else{
         return `${minutes} минут назад`
      }
   }

   if(minuts < 720){
      const hour = Math.floor(minuts/60)
      if(hour === 1 || hour === 21){
         return `${hour} час назад`
      }
      else if(hour > 20 || hour === 2 || hour === 3){
         return `${hour} часа назад`
      }
      else{
         return `${hour} часов назад`
      }
   }
   else{
      return start.toLocaleDateString("ru-RU", optionsDate)
   }
}


module.exports = {calcMinutes}