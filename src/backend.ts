import { near, BigInt, JSONValue, json, ipfs, log, TypedMap, Value, typeConversion, BigDecimal, bigInt, bigDecimal } from "@graphprotocol/graph-ts"
import { Serie, Nft, Controlaforo, Controlobject, Market, User, Gender } from "../generated/schema"

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i], 
      receipt.receipt, 
      receipt.outcome,
      receipt.block.header
    );
  }
}

//const list_contract_atributos_referencia = [];
const fechaIndex = 1713219792924020206;

function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  outcome: near.ExecutionOutcome,
  blockHeader: near.BlockHeader
): void {
    
  if (action.kind != near.ActionKind.FUNCTION_CALL) return;
  
  const data = action.toFunctionCall();

  //se obtiene el nombre del metodo que fue ejecutado en el smart contract
  const methodName = action.toFunctionCall().methodName;
  

  if (methodName == 'set_user') {

    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();

      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const artist_name = data.get('artist_name')
        const public_url = data.get('public_url')
        const age = data.get('age')
        const location = data.get('location')
        const youare = data.get('youare')
        const email = data.get('email')
        const music_genre = data.get('music_genre')
        const description = data.get('description')
        const wallet = data.get('wallet')

        if (!artist_name || !public_url || !age || !location || !youare || !email || !music_genre || !description || !wallet) return


        let user = User.load(wallet.toString())
        if (!user) {
          user = new User(wallet.toString())
          user.wallet = wallet.toString()
        }
        user.artist_name = artist_name.toString()
        user.public_url = public_url.toString()
        user.age = age.toBigInt()
        user.location = location.toString()
        user.youare = youare.toString()
        user.email = email.toString()
        user.music_genre = music_genre.toBigInt()
        user.description = description.toString()
        
        user.save()
        
      }
    }
  }


  if (methodName == 'set_gender') {
    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();

      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const id = data.get('id')
        const name = data.get('name')

        if (!id || !name) return


        let gender = Gender.load(id.toBigInt().toString())
        if (!gender) {
          gender = new Gender(id.toBigInt().toString())
        }
        gender.name = name.toString()
        
        gender.save()
        
      }
    }
  }


  if (methodName == 'update_nft_event') {
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();

      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const token_series_id = data.get('token_series_id')
        const metadatalog = data.get('token_metadata')
        const is_mintable = data.get('is_mintable')

        if (!token_series_id || !metadatalog) return

        //convertimos la variable metadata en un objeto para poder acceder a sus variebles internas
        const metadata = metadatalog.toObject()

        //en caso de que no se transformable en un objeto se detiene la funcion
        if(!metadata) return

        //declaramos las variables dentro del objeto metadata
        const title = metadata.get('title')
        const description = metadata.get('description')
        const media = metadata.get('media')
        const price = data.get('price')
        const copies = metadata.get('copies')
        
    
        
        //se verifica que todas las variables que necesitamos existan en el objeto metadata
        if(!title || !description || !media || !price) return
        
        if(title.isNull() || media.isNull()) return

        let serie = Serie.load(token_series_id.toString())
        if (serie) {
          serie.title = title.toString()
          if(!description.isNull()) { serie.description = description.toString() }
          serie.media = media.toString()
          if(!price.isNull()) { serie.price = BigDecimal.fromString(price.toString()) }
          if(copies) { 
            if(!copies.isNull()) { serie.copies = copies.toBigInt() } 
          }
          if(is_mintable) {
            serie.is_mintable = is_mintable.toBool()
          }
          serie.save()
        }
        
      }
    }
  }


 //dfdsfsdfsdfsdf
 //asddasdsd
  if (methodName == 'nft_sample') {
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      for (let index = 0; index < outcome.logs.length; index++) {
        const outcomeLog = outcome.logs[index].toString();
        
        if(!json.try_fromString(outcomeLog).isOk) return
        let outcomelogs = json.try_fromString(outcomeLog);
        const jsonObject = outcomelogs.value.toObject();

        if (jsonObject) {
          const logJson = jsonObject.get('params');
          if (!logJson) return;
          const data = logJson.toObject();
          
          const serie_id = data.get('token_series_id')
          const creator_id = data.get('creator_id')
          const price = data.get('price')
          const metadatalog = data.get('token_metadata')
          const object_event = data.get('object_event')
          

          if (!serie_id || !creator_id || !price || !metadatalog || !object_event) return

          //convertimos la variable metadata en un objeto para poder acceder a sus variebles internas
          const metadata = metadatalog.toObject()

          //en caso de que no se transformable en un objeto se detiene la funcion
          if(!metadata) return

          //declaramos las variables dentro del objeto metadata
          const title = metadata.get('title')
          const description = metadata.get('description')
          const media = metadata.get('media')
          const extra = metadata.get('extra')
          const copies = metadata.get('copies')
          const reference = metadata.get('reference')
          const issued_at = metadata.get('issued_at')
          const starts_at = metadata.get('starts_at')
          const updated_at = metadata.get('updated_at')
          const expires_at = metadata.get('expires_at')
          

          //se verifica que todas las variables que necesitamos existan en el objeto metadata
          if(!title || !description || !media || !extra) return

          if(title.isNull() || media.isNull()) return
          
          //log.warning('paso {}', ["1.2"])
    
          let serie = Serie.load(serie_id.toString())
          let typetoken_id = serie_id.toString().split("|")[0].toString()

          if (!serie) {
            serie = new Serie(serie_id.toString())
            serie.typetoken_id = typetoken_id
            serie.object_event = object_event.toBool()
            serie.title = title.toString()
            if(!description.isNull()) { serie.description = description.toString() }
            serie.media = media.toString()
            if(!extra.isNull()) { serie.extra = extra.toString() }
            if(!reference!.isNull()) { serie.reference = reference!.toString() }
            if(!issued_at!.isNull()) {serie.issued_at = issued_at!.toString() }
            if(!starts_at!.isNull()) {serie.starts_at = starts_at!.toString() }
            if(!updated_at!.isNull()) {serie.updated_at = updated_at!.toString() }
            if(!expires_at!.isNull()) {serie.expires_at = expires_at!.toString() }
            serie.creator_id = creator_id.toString()
            if(!price.isNull()) { 
              serie.price = BigDecimal.fromString(price.toF64().toString())
              serie.price_near = bigDecimal.fromString("0")//BigDecimal.fromString(price.toString()).divDecimal(BigDecimal.fromString("1000000000000000000000000"))
            }
            serie.nft_amount_sold = bigInt.fromString("0")
            serie.supply = BigInt.fromString("0")
            serie.nftsold = BigInt.fromString("0")
            serie.redeemerevents = BigInt.fromString("0")
            serie.redeemerobjects = BigInt.fromString("0")
            serie.aproved_event = BigInt.fromString("0")
            serie.aproved_objects = BigInt.fromString("0")
            if(copies) { 
              if(!copies.isNull()) { serie.copies = copies.toBigInt() } 
            }
            serie.is_mintable = true
            serie.fecha = BigInt.fromU64(blockHeader.timestampNanosec)
            serie.save()
          }
          
        }
      }
    }
    //let utcSeconds = (blockHeader.timestampNanosec / 1000000);
    //let date = new Date(utcSeconds)
    
    //log.warning("fehca: {} ----  fecha epoch: {}", [date.toISOString().split('T')[0].toString(), utcSeconds.toString()])
  }
  


  //este evento es disparado cuando el metodo es create_form
  if (methodName == 'nft_mint') {  
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      for (let index = 0; index < outcome.logs.length; index++) {
        //obtenemos la primera iteracion del log
        const outcomeLog = outcome.logs[index].toString();

        if(outcomeLog.substring(0, 11) == "EVENT_JSON:") {
          const parsed = outcomeLog.replace('EVENT_JSON:', '')
          //convirtiendo el log en un objeto ValueJSON
          let outcomelogs = json.try_fromString(parsed);
        
          //validamos que se cree un objeto tipo ValueJSON valido a partir del log capturado
          if(!outcomelogs.isOk) return;

          const jsonlog = outcomelogs.value.toObject();
          
          const eventData = jsonlog.get('data')
          if (!eventData) return
          
          const eventArray:JSONValue[] = eventData.toArray()
          
          const data = eventArray[0].toObject()
          const tokenIds = data.get('token_ids')
          const owner_id = data.get('owner_id')
          
          if (!tokenIds || !owner_id) return
          
          const ids:JSONValue[] = tokenIds.toArray()
          const tokenId = ids[0].toString()

          const serie_id = tokenId.split(":", 1)[0].toString()
          

          let serie = Serie.load(serie_id)
          if(!serie) return

          //buscamos si existe un token id
          let nft = Nft.load(tokenId)

          let typetoken_id = serie_id.toString().split("|")[0].toString()
          //validando que el token id no exista para agregarlo
          if(!nft) { 
            //se crea un nevo espacion en memoria de Form asociado al id y se guardan los datos
            nft = new Nft(tokenId)
            nft.serie_id = serie_id
            nft.owner_id = owner_id.toString()
            nft.title = serie.title + " # " + tokenId.split(":", 2)[1].toString()
            nft.metadata = serie_id
            nft.fecha = BigInt.fromU64(blockHeader.timestampNanosec)
            nft.typetoken_id = typetoken_id
            nft.save()

            if (typetoken_id == "1") {
              serie.supply = serie.supply.plus(BigInt.fromString("1"))
              serie.save()
            }
          }

        } else {
          if(!json.try_fromString(outcomeLog).isOk) return
          let outcomelogs = json.try_fromString(outcomeLog);
          const jsonObject = outcomelogs.value.toObject();

          if (jsonObject) {
            const logJson = jsonObject.get('params');
            if (!logJson) return;
            const data = logJson.toObject();
            
            const token_series_id = data.get('token_series_id')

            const is_mintable = data.get('is_mintable')

            if (!token_series_id) return
            
            let serie = Serie.load(token_series_id.toString())
            if(serie) {
              if(is_mintable) { serie.is_mintable = is_mintable.toBool() }
              serie.save()
            }

          }
        }
      }
    }
  }
  

   //este evento es disparado cuando el metodo es create_form
   if (methodName == 'nft_buy') {
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      for (let index = 0; index < outcome.logs.length; index++) {
        //obtenemos la primera iteracion del log
        const outcomeLog = outcome.logs[index].toString();

        if(outcomeLog.substring(0, 11) == "EVENT_JSON:") {
          const parsed = outcomeLog.replace('EVENT_JSON:', '')
          //convirtiendo el log en un objeto ValueJSON
          let outcomelogs = json.try_fromString(parsed);
        
          //validamos que se cree un objeto tipo ValueJSON valido a partir del log capturado
          if(!outcomelogs.isOk) return;

          const jsonlog = outcomelogs.value.toObject();
          
          const eventData = jsonlog.get('data')
          if (!eventData) return
          
          const eventArray:JSONValue[] = eventData.toArray()
          
          const data = eventArray[0].toObject()
          const tokenIds = data.get('token_ids')
          const owner_id = data.get('owner_id')
          
          if (!tokenIds || !owner_id) return
          
          const ids:JSONValue[] = tokenIds.toArray()
          const tokenId = ids[0].toString()

          const serie_id = tokenId.split(":", 1)[0].toString()
          

          let serie = Serie.load(serie_id)
          if(!serie) return

          //buscamos si existe un token id
          let nft = Nft.load(tokenId)

          let typetoken_id = serie_id.toString().split("|")[0].toString()
          //validando que el token id no exista para agregarlo
          if(!nft) { 
            //se crea un nevo espacion en memoria de Form asociado al id y se guardan los datos
            nft = new Nft(tokenId)
            nft.serie_id = serie_id
            nft.owner_id = owner_id.toString()
            nft.title = serie.title + " # " + tokenId.split(":", 2)[1].toString()
            nft.metadata = serie_id
            nft.fecha = BigInt.fromU64(blockHeader.timestampNanosec)
            nft.typetoken_id = typetoken_id
            nft.save()

            if (typetoken_id == "1") {
              serie.supply = serie.supply.plus(BigInt.fromString("1"))
              serie.nftsold = serie.nftsold.plus(BigInt.fromString("1"))
              serie.save()
            }
          
          }

        } else {
          if(!json.try_fromString(outcomeLog).isOk) return
          let outcomelogs = json.try_fromString(outcomeLog);
          const jsonObject = outcomelogs.value.toObject();

          if (jsonObject) {
            const logJson = jsonObject.get('params');
            if (!logJson) return;
            const data = logJson.toObject();
            
            const token_series_id = data.get('token_series_id')
            const amount_creator = data.get('amount_creator')
            const is_mintable = data.get('is_mintable')

            if (token_series_id) {
              let serie = Serie.load(token_series_id.toString())
              if(serie) {
                if(is_mintable) { serie.is_mintable = is_mintable.toBool() }
                if(amount_creator) { serie.nft_amount_sold = serie.nft_amount_sold.plus(BigInt.fromString(amount_creator.toString())) }
                serie.save()
              }
            }

          }
        }
      }
    }
  }

  if (methodName == 'nft_transfer' || methodName == 'nft_transfer_payout' || methodName == 'nft_transfer_unsafe' || methodName == 'nft_transfer_call') { 
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      //obtenemos la primera iteracion del log
      const outcomeLog = outcome.logs[0].toString();
      const parsed = outcomeLog.replace('EVENT_JSON:', '')  
      //convirtiendo el log en un objeto ValueJSON
      let outcomelogs = json.try_fromString(parsed);
    
      //validamos que se cree un objeto tipo ValueJSON valido a partir del log capturado
      if(!outcomelogs.isOk) return

      const jsonlog = outcomelogs.value.toObject();
      
      const eventData = jsonlog.get('data')
      if (!eventData) return
      
      const eventArray:JSONValue[] = eventData.toArray()

      const data = eventArray[0].toObject()
      const tokenIds = data.get('token_ids')
      const new_owner_id = data.get('new_owner_id')
      
      if (!tokenIds || !new_owner_id) return
      
      const ids:JSONValue[] = tokenIds.toArray()
      const tokenId = ids[0].toString()

      //buscamos si existe un token id
      let nft = Nft.load(tokenId)
      //validando que el token id exista para actualizar el owner
      if(nft) { 
        nft.owner_id = new_owner_id.toString() 
        nft.save()
      }

      //si existe en el market lo eliminamos
      const id = tokenId.toString() + "|" + receipt.receiverId.toString()

      let market = Market.load(id)
      if (market) {
        market.delete()    
      }

    }
  }

  
  if (methodName == 'nft_burn' || methodName == 'burn_object') {
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      //obtenemos la primera iteracion del log
      const outcomeLog = outcome.logs[0].toString();
      const parsed = outcomeLog.replace('EVENT_JSON:', '')  
      //convirtiendo el log en un objeto ValueJSON
      let outcomelogs = json.try_fromString(parsed);
    
      //validamos que se cree un objeto tipo ValueJSON valido a partir del log capturado
      if(!outcomelogs.isOk) return

      const jsonlog = outcomelogs.value.toObject();
      
      const eventData = jsonlog.get('data')
      if (!eventData) return
      
      const eventArray:JSONValue[] = eventData.toArray()

      const data = eventArray[0].toObject()
      const tokenIds = data.get('token_ids')
      const owner_id = data.get('owner_id')
      
      if (!tokenIds || !owner_id) return
      
      const ids:JSONValue[] = tokenIds.toArray()
      const tokenId = ids[0].toString()

      //buscamos si existe un token id
      let nft = Nft.load(tokenId)
      //validando que el token id exista para eliminarlo
      if(nft) { 
        nft.delete()
      }


      //si existe en el market lo eliminamos
      const id = tokenId.toString() + "|" + owner_id.toString()

      let market = Market.load(id)
      if (market) {
        market.delete()    
      }

      if(methodName == 'burn_object') {
        let object_event = false
        let token_serie_id = ""
        let token_objec_id = tokenId.toString().split(":")[0].toString()
        let serie_object = Serie.load(token_objec_id)
        if(serie_object){
          object_event = serie_object.object_event
          token_serie_id = serie_object.reference!
          
          let serie = Serie.load(token_serie_id)
          if(serie) {
            if(object_event){
              serie.redeemerevents = serie.redeemerevents.plus(BigInt.fromString("1"))
            } else {
              serie.redeemerobjects = serie.redeemerobjects.plus(BigInt.fromString("1"))
            }
            serie.save()
          }
        }

        const outcomeLog = outcome.logs[1].toString();
        
        if(!json.try_fromString(outcomeLog).isOk) return
        let outcomelogs = json.try_fromString(outcomeLog);
        const jsonObject = outcomelogs.value.toObject();

        if (jsonObject) {
          const logJson = jsonObject.get('params');
          if (!logJson) return;
          const data = logJson.toObject();
          
          const token_id = data.get('token_id')
          const ownerid = data.get('owner_id')
          const token_object_id = data.get('token_object_id')
          const user_burn = data.get('user_burn')

          if (!token_id || !ownerid || !token_object_id || !user_burn) return
          
          if(object_event){
            let aforo = new Controlaforo(token_id.toString())
            aforo.owner_id = ownerid.toString()
            aforo.token_object_id = token_object_id.toString()
            aforo.event_id = token_serie_id
            aforo.user_burn = user_burn.toString()
            aforo.fecha = BigInt.fromU64(blockHeader.timestampNanosec)
            aforo.aproved = false
            aforo.save()
          } else {
            let objectc = new Controlobject(token_id.toString())
            objectc.owner_id = ownerid.toString()
            objectc.token_object_id = token_object_id.toString()
            objectc.event_id = token_serie_id
            objectc.user_burn = user_burn.toString()
            objectc.fecha = BigInt.fromU64(blockHeader.timestampNanosec)
            objectc.aproved = false
            objectc.save()
          }
        }
      }
    }
  }

  if (methodName == 'approved_object') {
    if(BigInt.fromU64(blockHeader.timestampNanosec).lt(BigInt.fromI64(fechaIndex))) return

    if(outcome.logs.length > 0) {
      const outcomeLog = outcome.logs[0].toString();
      
      if(!json.try_fromString(outcomeLog).isOk) return
      let outcomelogs = json.try_fromString(outcomeLog);
      const jsonObject = outcomelogs.value.toObject();

      if (jsonObject) {
        const logJson = jsonObject.get('params');
        if (!logJson) return;
        const data = logJson.toObject();
        
        const token_id = data.get('token_id')
        
        if (!token_id) return

        let aforo = Controlaforo.load(token_id.toString())
        if(aforo){
          aforo.aproved = true
          let serie = Serie.load(aforo.event_id)
          if(serie){
            serie.aproved_event = serie.aproved_event.plus(BigInt.fromI32(1))
            serie.save()
          }
          aforo.save()  
        }

        let objects = Controlobject.load(token_id.toString())
        if(objects){
          objects.aproved = true
          let serie = Serie.load(objects.event_id)
          if(serie){
            serie.aproved_objects = serie.aproved_objects.plus(BigInt.fromI32(1))
            serie.save()
          }
          objects.save()  
        }
        
        
        
      }
    }
  }


}