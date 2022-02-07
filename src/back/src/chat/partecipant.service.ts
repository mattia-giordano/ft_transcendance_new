import {
	BadRequestException,
	Injectable,
	NotFoundException,
	Query
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
import { Channels } from './models/channel.entity';
import { Message } from './models/message.entity';
import { messageDto } from './dto/message.dto';
import { Partecipant } from './models/partecipant.entity';
  
  @Injectable()
  export class PartecipantService {
	constructor(
	  @InjectRepository(Partecipant) private readonly partecipantDB: Repository<Partecipant>,
	) {}
  
	async getAll(): Promise<Partecipant[]> {
	  return this.partecipantDB.find();
	}
  
	async getByUser(userId: number): Promise<Partecipant[]> {
	  return this.partecipantDB.find({ where: { userId } });
	}
  
	async getByChannel(channelId: number): Promise<Partecipant[]> {
	  return this.partecipantDB.find({ where: { channelId } });
	}
  
	async create(partecipant: Partecipant): Promise<Partecipant> {
	  return this.partecipantDB.save({
		userId: partecipant.userId,
		//channelId: message.channelId,
		muted : partecipant.muted,
		mod : partecipant.mod,
	  });
	}

	async delete(id: number) {
	  return this.partecipantDB.delete({ id });
	}
  

  }
  